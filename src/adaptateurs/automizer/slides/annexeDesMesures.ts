import { Automizer, ISlide, modify } from 'pptx-automizer';
import {
  MODELE,
  SLIDE_ANNEXE_A_LANCER,
  SLIDE_ANNEXE_FAITE,
  SLIDE_ANNEXE_PARTIELLE,
  SLIDE_ANNEXE_STATUT_A_DEFINIR,
} from '../template.js';
import {
  MesureDeLAnnexe,
  MesuresDUnStatut,
  StatutDeLAnnexe,
} from '../../../modeles/objetsPowerpoint/annexeDesMesures.js';
import { auPluriel } from '../texte.js';

const NOMBRE_DE_LIGNES_DE_MESURES = 9;
const PARTIES_D_UNE_LIGNE = [
  'fond-mesure',
  'mesure',
  'fond-categorie',
  'categorie',
  'fond-criticite',
  'criticite',
  'fond-referentiel',
  'referentiel',
];

const SLIDES_DES_STATUTS: Record<StatutDeLAnnexe, number> = {
  fait: SLIDE_ANNEXE_FAITE,
  enCours: SLIDE_ANNEXE_PARTIELLE,
  aLancer: SLIDE_ANNEXE_A_LANCER,
  sansStatut: SLIDE_ANNEXE_STATUT_A_DEFINIR,
};

const ecrisLaLigne = (
  slide: ISlide,
  forme: (partie: string) => string,
  { description, categorie, criticite, referentiel }: MesureDeLAnnexe
) => {
  slide.modifyElement(forme('mesure'), modify.setText(description));
  slide.modifyElement(forme('categorie'), modify.setText(categorie));
  slide.modifyElement(forme('criticite'), modify.setText(criticite));
  slide.modifyElement(forme('referentiel'), modify.setText(referentiel));
};

const ecrisLesLignes = (slide: ISlide, mesures: MesureDeLAnnexe[]) => {
  Array.from(
    { length: NOMBRE_DE_LIGNES_DE_MESURES },
    (_, index) => index + 1
  ).forEach((numeroLigne) => {
    const mesure = mesures[numeroLigne - 1];
    const forme = (partie: string) => `mesure-${numeroLigne}-${partie}`;
    if (!mesure) {
      PARTIES_D_UNE_LIGNE.forEach((partie) =>
        slide.removeElement(forme(partie))
      );
      return;
    }
    ecrisLaLigne(slide, forme, mesure);
  });
};

export const ajouteLAnnexeDesMesures = (
  presentation: Automizer,
  annexe: MesuresDUnStatut[]
) => {
  annexe.forEach(({ statut, mesures }) =>
    presentation.addSlide(MODELE, SLIDES_DES_STATUTS[statut], (slide) => {
      slide.modifyElement(
        'annexe-nombre',
        modify.replaceText([
          { replace: 'nombre', by: { text: String(mesures.length) } },
          {
            replace: 'mesures',
            by: { text: auPluriel(mesures.length, 'mesure', 'mesures') },
          },
        ])
      );
      ecrisLesLignes(slide, mesures);
    })
  );
};

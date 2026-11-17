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
import { auPluriel, nombreDeLignesALaLargeurEnArial } from '../texte.js';
import { decoupeEnPagesALaHauteur } from '../pagination.js';
import { ecrisLaPastilleDuStatut } from '../pastillesDesStatuts.js';

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

const FONDS_D_UNE_LIGNE = PARTIES_D_UNE_LIGNE.filter((partie) =>
  partie.startsWith('fond-')
);
const TEXTES_D_UNE_LIGNE = PARTIES_D_UNE_LIGNE.filter(
  (partie) => !partie.startsWith('fond-')
);

const HAUT_DE_LA_PREMIERE_LIGNE = 3070845;
const HAUTEUR_D_UNE_LIGNE_A_DESCRIPTION_COURTE = 664815;
const ECART_ENTRE_LIGNES = 57150;
const HAUT_DES_TEXTES_DANS_LA_LIGNE = 171450;
const HAUTEUR_D_UN_TEXTE_SUR_UNE_LIGNE = 360015;
const HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION = 319710;
const LARGEUR_UTILE_DE_LA_DESCRIPTION = 9314307 - 2 * 25400;
const TAILLE_DE_LA_DESCRIPTION = 19.5;

const BAS_DES_LIGNES = 9786938 - 114300;

type DispositionDUneLigne = { y: number; agrandissement: number };

const agrandissementDeLaLigne = ({ description }: MesureDeLAnnexe) =>
  (nombreDeLignesALaLargeurEnArial(
    description,
    LARGEUR_UTILE_DE_LA_DESCRIPTION,
    TAILLE_DE_LA_DESCRIPTION
  ) -
    1) *
  HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION;

const disposeLesLignes = (mesures: MesureDeLAnnexe[]) =>
  mesures.reduce<DispositionDUneLigne[]>((lignes, mesure) => {
    const precedente = lignes[lignes.length - 1];
    const y = precedente
      ? precedente.y +
        HAUTEUR_D_UNE_LIGNE_A_DESCRIPTION_COURTE +
        precedente.agrandissement +
        ECART_ENTRE_LIGNES
      : HAUT_DE_LA_PREMIERE_LIGNE;
    return [...lignes, { y, agrandissement: agrandissementDeLaLigne(mesure) }];
  }, []);

const tiennentSurLaPage = (mesures: MesureDeLAnnexe[]) => {
  const derniere = disposeLesLignes(mesures)[mesures.length - 1];
  return (
    mesures.length <= NOMBRE_DE_LIGNES_DE_MESURES &&
    derniere.y +
      HAUTEUR_D_UNE_LIGNE_A_DESCRIPTION_COURTE +
      derniere.agrandissement <=
      BAS_DES_LIGNES
  );
};

const placeLaLigne = (
  slide: ISlide,
  forme: (partie: string) => string,
  { y, agrandissement }: DispositionDUneLigne
) => {
  FONDS_D_UNE_LIGNE.forEach((partie) =>
    slide.modifyElement(
      forme(partie),
      modify.setPosition({
        y,
        h: HAUTEUR_D_UNE_LIGNE_A_DESCRIPTION_COURTE + agrandissement,
      })
    )
  );
  TEXTES_D_UNE_LIGNE.forEach((partie) =>
    slide.modifyElement(
      forme(partie),
      modify.setPosition({
        y: y + HAUT_DES_TEXTES_DANS_LA_LIGNE,
        h: HAUTEUR_D_UN_TEXTE_SUR_UNE_LIGNE + agrandissement,
      })
    )
  );
};

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
  const lignes = disposeLesLignes(mesures);
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
    placeLaLigne(slide, forme, lignes[numeroLigne - 1]);
    ecrisLaLigne(slide, forme, mesure);
  });
};

const ecrisLeNombreDeMesures = (slide: ISlide, nombre: number) =>
  slide.modifyElement(
    'annexe-nombre',
    modify.replaceText([
      { replace: 'nombre', by: { text: String(nombre) } },
      {
        replace: 'mesures',
        by: { text: auPluriel(nombre, 'mesure', 'mesures') },
      },
    ])
  );

export const ajouteLAnnexeDesMesures = (
  presentation: Automizer,
  annexe: MesuresDUnStatut[]
) => {
  annexe.forEach(({ statut, mesures }) => {
    const pages = decoupeEnPagesALaHauteur(mesures, tiennentSurLaPage);
    pages.forEach((mesuresDeLaPage) =>
      presentation.addSlide(MODELE, SLIDES_DES_STATUTS[statut], (slide) => {
        ecrisLaPastilleDuStatut(
          slide,
          { fond: 'annexe-statut-fond', texte: 'annexe-statut-texte' },
          statut
        );
        ecrisLeNombreDeMesures(slide, mesures.length);
        ecrisLesLignes(slide, mesuresDeLaPage);
      })
    );
  });
};

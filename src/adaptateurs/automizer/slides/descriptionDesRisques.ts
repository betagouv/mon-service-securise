import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_DESCRIPTION_DES_RISQUES } from '../template.js';
import {
  COULEURS_DES_NIVEAUX_DE_RISQUE,
  RisqueCartographie,
} from '../../../modeles/objetsPowerpoint/risqueCartographie.js';
import { colore } from '../formes.js';
import { nombreDeLignesDeTexte } from '../texte.js';

const NOMBRE_DE_LIGNES_DE_LA_DESCRIPTION_DES_RISQUES = 7;
const PARTIES_D_UNE_LIGNE_DE_DESCRIPTION = [
  'fond-reference',
  'pastille',
  'identifiant',
  'fond-intitule',
  'intitule',
  'fond-description',
  'description',
];

const CARACTERES_PAR_LIGNE_D_UN_INTITULE = 44;
const CARACTERES_PAR_LIGNE_D_UNE_DESCRIPTION = 85;
const HAUTEUR_D_UNE_LIGNE_DE_TEXTE = 274320;
const MARGES_VERTICALES_D_UNE_LIGNE = 76200;
const MARGES_INTERIEURES_D_UN_TEXTE = 50800;
const MARGE_HAUTE_D_UN_TEXTE = 38100;
const HAUTEUR_D_UNE_PASTILLE = 300038;
const DECALAGE_DE_L_IDENTIFIANT_DANS_SA_PASTILLE = 19050;
const HAUT_DE_LA_PREMIERE_LIGNE = 2708970;
const ECART_ENTRE_LIGNES = 38100;

const hauteurDeLaLigne = ({ intitule, description }: RisqueCartographie) =>
  MARGES_VERTICALES_D_UNE_LIGNE +
  MARGES_INTERIEURES_D_UN_TEXTE +
  Math.max(
    nombreDeLignesDeTexte(intitule, CARACTERES_PAR_LIGNE_D_UN_INTITULE),
    nombreDeLignesDeTexte(description, CARACTERES_PAR_LIGNE_D_UNE_DESCRIPTION)
  ) *
    HAUTEUR_D_UNE_LIGNE_DE_TEXTE;

const disposeLesLignes = (risques: RisqueCartographie[]) =>
  risques.reduce<{ y: number; hauteur: number }[]>((lignes, risque) => {
    const precedente = lignes[lignes.length - 1];
    const y = precedente
      ? precedente.y + precedente.hauteur + ECART_ENTRE_LIGNES
      : HAUT_DE_LA_PREMIERE_LIGNE;
    return [...lignes, { y, hauteur: hauteurDeLaLigne(risque) }];
  }, []);

const placeLaLigne = (
  slide: ISlide,
  forme: (partie: string) => string,
  { y, hauteur }: { y: number; hauteur: number }
) => {
  ['fond-reference', 'fond-intitule', 'fond-description'].forEach((partie) =>
    slide.modifyElement(forme(partie), modify.setPosition({ y, h: hauteur }))
  );
  const yDeLaPastille = y + Math.floor((hauteur - HAUTEUR_D_UNE_PASTILLE) / 2);
  slide.modifyElement(
    forme('pastille'),
    modify.setPosition({ y: yDeLaPastille })
  );
  slide.modifyElement(
    forme('identifiant'),
    modify.setPosition({
      y: yDeLaPastille + DECALAGE_DE_L_IDENTIFIANT_DANS_SA_PASTILLE,
    })
  );
  ['intitule', 'description'].forEach((partie) =>
    slide.modifyElement(
      forme(partie),
      modify.setPosition({
        y: y + MARGE_HAUTE_D_UN_TEXTE,
        h: hauteur - MARGES_VERTICALES_D_UNE_LIGNE,
      })
    )
  );
};

const nombreDeRisques = (nombre: number) =>
  nombre > 1 ? `${nombre} risques` : `${nombre} risque`;

const ecrisLesLignes = (slide: ISlide, risques: RisqueCartographie[]) => {
  const lignes = disposeLesLignes(risques);
  Array.from(
    { length: NOMBRE_DE_LIGNES_DE_LA_DESCRIPTION_DES_RISQUES },
    (_, index) => index + 1
  ).forEach((numeroLigne) => {
    const risque = risques[numeroLigne - 1];
    const forme = (partie: string) =>
      `description-risque-${numeroLigne}-${partie}`;
    if (!risque) {
      PARTIES_D_UNE_LIGNE_DE_DESCRIPTION.forEach((partie) =>
        slide.removeElement(forme(partie))
      );
      return;
    }
    placeLaLigne(slide, forme, lignes[numeroLigne - 1]);
    slide.modifyElement(
      forme('pastille'),
      colore(COULEURS_DES_NIVEAUX_DE_RISQUE[risque.niveau])
    );
    slide.modifyElement(
      forme('identifiant'),
      modify.setText(risque.identifiant)
    );
    slide.modifyElement(forme('intitule'), modify.setText(risque.intitule));
    slide.modifyElement(
      forme('description'),
      modify.setText(risque.description)
    );
  });
};

export const ajouteLaDescriptionDesRisques = (
  presentation: Automizer,
  risques: RisqueCartographie[]
) => {
  presentation.addSlide(MODELE, SLIDE_DESCRIPTION_DES_RISQUES, (slide) => {
    slide.modifyElement(
      'description-risques-total',
      modify.setText(nombreDeRisques(risques.length))
    );
    ecrisLesLignes(slide, risques);
  });
};

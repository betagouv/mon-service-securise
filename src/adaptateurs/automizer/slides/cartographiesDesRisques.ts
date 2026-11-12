import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_CARTOGRAPHIE_DES_RISQUES } from '../template.js';
import { CartographiesDesRisques } from '../../../modeles/objetsPowerpoint/cartographiesDesRisques.js';
import {
  COULEURS_DES_NIVEAUX_DE_RISQUE,
  RisqueCartographie,
} from '../../../modeles/objetsPowerpoint/risqueCartographie.js';
import {
  changeLaTailleDePolice,
  nombreDeLignesDeTexte,
  Police,
  policeQuiConvient,
} from '../texte.js';
import { colore, ecrisNumeroDePage } from '../formes.js';
import { decoupeEnPagesALaHauteur } from '../pagination.js';

const POLICES_D_UNE_CASE_DE_LA_MATRICE: Police[] = [
  { taille: 18, caracteresParLigne: 11, lignes: 3 },
  { taille: 16, caracteresParLigne: 12, lignes: 3 },
  { taille: 14, caracteresParLigne: 14, lignes: 4 },
  { taille: 12, caracteresParLigne: 16, lignes: 4 },
];
const GRAVITES_DE_LA_MATRICE = [1, 2, 3, 4];
const VRAISEMBLANCES_DE_LA_MATRICE = [1, 2, 3, 4];

const ecrisLaMatrice = (slide: ISlide, risques: RisqueCartographie[]) => {
  GRAVITES_DE_LA_MATRICE.forEach((gravite) =>
    VRAISEMBLANCES_DE_LA_MATRICE.forEach((vraisemblance) => {
      const identifiants = risques
        .filter(
          (risque) =>
            risque.gravite === gravite && risque.vraisemblance === vraisemblance
        )
        .map(({ identifiant }) => identifiant);
      const texte = identifiants.join(', ');
      slide.modifyElement(`matrice-g${gravite}-v${vraisemblance}`, [
        modify.setText(texte),
        changeLaTailleDePolice(
          policeQuiConvient(texte, POLICES_D_UNE_CASE_DE_LA_MATRICE).taille
        ),
      ]);
    })
  );
};

const NOMBRE_DE_LIGNES_DE_LA_LISTE_DES_RISQUES = 7;
const PARTIES_D_UNE_LIGNE_DE_RISQUE = [
  'fond',
  'pastille',
  'identifiant',
  'intitule',
];

const CARACTERES_PAR_LIGNE_D_UN_INTITULE_DE_RISQUE = 48;
const HAUTEUR_D_UNE_LIGNE_DE_TEXTE_D_UN_RISQUE = 274320;
const MARGES_VERTICALES_DE_L_INTITULE_DE_RISQUE = 76200;
const MARGES_INTERIEURES_DE_L_INTITULE_DE_RISQUE = 50800;

const hauteurDeLaLigneDuRisque = ({ intitule }: RisqueCartographie) =>
  MARGES_VERTICALES_DE_L_INTITULE_DE_RISQUE +
  MARGES_INTERIEURES_DE_L_INTITULE_DE_RISQUE +
  nombreDeLignesDeTexte(
    intitule,
    CARACTERES_PAR_LIGNE_D_UN_INTITULE_DE_RISQUE
  ) *
    HAUTEUR_D_UNE_LIGNE_DE_TEXTE_D_UN_RISQUE;

const HAUTEUR_D_UNE_PASTILLE_DE_RISQUE = 300038;
const DECALAGE_DE_L_IDENTIFIANT_DANS_SA_PASTILLE = 19050;
const MARGE_HAUTE_DE_L_INTITULE_DE_RISQUE = 57150;
const HAUT_DE_LA_PREMIERE_LIGNE_DE_RISQUE = 3190949;
const ECART_ENTRE_LIGNES_DE_RISQUE = 38100;

const disposeLesLignesDeRisque = (risques: RisqueCartographie[]) =>
  risques.reduce<{ y: number; hauteur: number }[]>((lignes, risque) => {
    const precedente = lignes[lignes.length - 1];
    const y = precedente
      ? precedente.y + precedente.hauteur + ECART_ENTRE_LIGNES_DE_RISQUE
      : HAUT_DE_LA_PREMIERE_LIGNE_DE_RISQUE;
    return [...lignes, { y, hauteur: hauteurDeLaLigneDuRisque(risque) }];
  }, []);

const nombreDeRisques = (nombre: number) =>
  nombre > 1 ? `${nombre} RISQUES` : `${nombre} RISQUE`;

const BAS_DE_LA_LISTE_DES_RISQUES = 9786938 - 114300;

const tiennentSurLaPage = (risques: RisqueCartographie[]) => {
  const lignes = disposeLesLignesDeRisque(risques);
  const derniere = lignes[lignes.length - 1];
  return (
    risques.length <= NOMBRE_DE_LIGNES_DE_LA_LISTE_DES_RISQUES &&
    derniere.y + derniere.hauteur <= BAS_DE_LA_LISTE_DES_RISQUES
  );
};

const ecrisLaListeDesRisques = (
  slide: ISlide,
  risques: RisqueCartographie[],
  nombreTotalDeRisques: number
) => {
  slide.modifyElement(
    'liste-risques-total',
    modify.setText(nombreDeRisques(nombreTotalDeRisques))
  );
  const lignes = disposeLesLignesDeRisque(risques);
  Array.from(
    { length: NOMBRE_DE_LIGNES_DE_LA_LISTE_DES_RISQUES },
    (_, index) => index + 1
  ).forEach((numeroLigne) => {
    const risque = risques[numeroLigne - 1];
    if (!risque) {
      PARTIES_D_UNE_LIGNE_DE_RISQUE.forEach((partie) =>
        slide.removeElement(`risque-${numeroLigne}-${partie}`)
      );
      return;
    }
    const { y, hauteur } = lignes[numeroLigne - 1];
    const yDeLaPastille =
      y + Math.floor((hauteur - HAUTEUR_D_UNE_PASTILLE_DE_RISQUE) / 2);
    slide.modifyElement(
      `risque-${numeroLigne}-fond`,
      modify.setPosition({ y, h: hauteur })
    );
    slide.modifyElement(
      `risque-${numeroLigne}-pastille`,
      modify.setPosition({ y: yDeLaPastille })
    );
    slide.modifyElement(
      `risque-${numeroLigne}-identifiant`,
      modify.setPosition({
        y: yDeLaPastille + DECALAGE_DE_L_IDENTIFIANT_DANS_SA_PASTILLE,
      })
    );
    slide.modifyElement(
      `risque-${numeroLigne}-intitule`,
      modify.setPosition({
        y: y + MARGE_HAUTE_DE_L_INTITULE_DE_RISQUE,
        h: hauteur - MARGES_VERTICALES_DE_L_INTITULE_DE_RISQUE,
      })
    );
    slide.modifyElement(
      `risque-${numeroLigne}-pastille`,
      colore(COULEURS_DES_NIVEAUX_DE_RISQUE[risque.niveau])
    );
    slide.modifyElement(
      `risque-${numeroLigne}-identifiant`,
      modify.setText(risque.identifiant)
    );
    slide.modifyElement(
      `risque-${numeroLigne}-intitule`,
      modify.setText(risque.intitule)
    );
  });
};

const TITRES_DES_CARTOGRAPHIES: Record<keyof CartographiesDesRisques, string> =
  {
    bruts: 'Cartographie des risques bruts',
    aDate: 'Cartographie des risques à date',
    cibles: 'Cartographie des risques résiduels cible',
  };

const ecrisLeTitreDeLaCartographie = (
  slide: ISlide,
  titre: string,
  numeroPage: number,
  nombrePages: number
) => {
  slide.modifyElement(
    'cartographie-titre',
    modify.replaceText({ replace: 'titre', by: { text: titre } })
  );
  ecrisNumeroDePage(slide, 'cartographie-titre', numeroPage, nombrePages);
};

export const ajouteLaCartographieDesRisques = (
  presentation: Automizer,
  cartographie: keyof CartographiesDesRisques,
  risques: RisqueCartographie[]
) => {
  const pagesDesRisques = decoupeEnPagesALaHauteur(risques, tiennentSurLaPage);
  pagesDesRisques.forEach((risquesDeLaPage, index) => {
    presentation.addSlide(MODELE, SLIDE_CARTOGRAPHIE_DES_RISQUES, (slide) => {
      ecrisLeTitreDeLaCartographie(
        slide,
        TITRES_DES_CARTOGRAPHIES[cartographie],
        index + 1,
        pagesDesRisques.length
      );
      ecrisLaMatrice(slide, risques);
      ecrisLaListeDesRisques(slide, risquesDeLaPage, risques.length);
    });
  });
};

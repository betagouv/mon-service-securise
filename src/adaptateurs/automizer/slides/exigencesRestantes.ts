import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_EXIGENCES_RESTANTES } from '../template.js';
import { colore, coloreLeTexte, ecrisNumeroDePage } from '../formes.js';
import { decoupeEnPagesALaHauteur } from '../pagination.js';
import {
  largeurDuTexteEnArial,
  nombreDeLignesALaLargeurEnArial,
} from '../texte.js';
import { ExigenceRestante } from '../../../modeles/objetsPowerpoint/exigencesRestantes.js';

const NOMBRE_DE_LIGNES_D_EXIGENCES = 5;
const NOMBRE_DE_CARTOUCHES_D_UNE_EXIGENCE = 4;
const PARTIES_D_UNE_LIGNE_D_EXIGENCE = [
  'fond-mesure',
  'description',
  ...Array.from({ length: NOMBRE_DE_CARTOUCHES_D_UNE_EXIGENCE }, (_, index) => [
    `cartouche-${index + 1}-fond`,
    `cartouche-${index + 1}-texte`,
  ]).flat(),
  'fond-statut',
  'statut-fond',
  'statut-texte',
  'fond-echeance',
  'echeance',
  'fond-porteurs',
  'porteurs',
];

const LARGEUR_DU_CADRE_D_UNE_DESCRIPTION = 8949177;
const MARGES_INTERNES_D_UNE_DESCRIPTION = 2 * 25400;
const TAILLE_DU_TEXTE_D_UNE_DESCRIPTION = 19.5;
const HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION = 297180;
const HAUT_DE_LA_PREMIERE_LIGNE = 2656508;
const HAUTEUR_D_UNE_LIGNE_A_DESCRIPTION_COURTE = 1155353;
const ECART_ENTRE_LIGNES = 57150;
const HAUT_DE_LA_DESCRIPTION = 190500;
const HAUTEUR_D_UNE_DESCRIPTION_COURTE = 360015;
const HAUT_DES_FONDS_DE_CARTOUCHE = 626715;
const HAUT_DES_TEXTES_DE_CARTOUCHE = 664815;
const HAUTEUR_DE_LA_PASTILLE_DU_STATUT = 376238;
const DECALAGE_DU_TEXTE_DANS_LA_PASTILLE_DU_STATUT = 57150;
const HAUT_DES_CELLULES_CENTREES = 190500;
const HAUTEUR_DES_CELLULES_CENTREES_A_DESCRIPTION_COURTE = 812453;

const X_DE_LA_PREMIERE_CARTOUCHE = 1066800;
const ECART_ENTRE_CARTOUCHES = 76200;
const MARGE_DU_TEXTE_DANS_SA_CARTOUCHE = 133350;
const TAILLE_DU_TEXTE_D_UNE_CARTOUCHE = 18;

type DispositionDUneLigne = { y: number; agrandissement: number };

const largeurDeLaCartouche = (texte: string) =>
  largeurDuTexteEnArial(texte, TAILLE_DU_TEXTE_D_UNE_CARTOUCHE) +
  2 * MARGE_DU_TEXTE_DANS_SA_CARTOUCHE;

const ecrisLesCartouches = (
  slide: ISlide,
  forme: (partie: string) => string,
  cartouches: string[],
  { y, agrandissement }: DispositionDUneLigne
) => {
  Array.from(
    { length: NOMBRE_DE_CARTOUCHES_D_UNE_EXIGENCE },
    (_, index) => index + 1
  ).reduce((x, numero) => {
    const fond = forme(`cartouche-${numero}-fond`);
    const texte = forme(`cartouche-${numero}-texte`);
    const cartouche = cartouches[numero - 1];
    if (!cartouche) {
      slide.removeElement(fond);
      slide.removeElement(texte);
      return x;
    }
    const largeur = largeurDeLaCartouche(cartouche);
    slide.modifyElement(
      fond,
      modify.setPosition({
        x,
        y: y + HAUT_DES_FONDS_DE_CARTOUCHE + agrandissement,
        w: largeur,
      })
    );
    slide.modifyElement(texte, [
      modify.setText(cartouche),
      modify.setPosition({
        x: x + MARGE_DU_TEXTE_DANS_SA_CARTOUCHE,
        y: y + HAUT_DES_TEXTES_DE_CARTOUCHE + agrandissement,
        w: largeur - MARGE_DU_TEXTE_DANS_SA_CARTOUCHE,
      }),
    ]);
    return x + largeur + ECART_ENTRE_CARTOUCHES;
  }, X_DE_LA_PREMIERE_CARTOUCHE);
};

const agrandissementDeLaLigne = ({ description }: ExigenceRestante) =>
  (nombreDeLignesALaLargeurEnArial(
    description,
    LARGEUR_DU_CADRE_D_UNE_DESCRIPTION - MARGES_INTERNES_D_UNE_DESCRIPTION,
    TAILLE_DU_TEXTE_D_UNE_DESCRIPTION
  ) -
    1) *
  HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION;

const disposeLesLignes = (exigences: ExigenceRestante[]) =>
  exigences.reduce<DispositionDUneLigne[]>((lignes, exigence) => {
    const precedente = lignes[lignes.length - 1];
    const y = precedente
      ? precedente.y +
        HAUTEUR_D_UNE_LIGNE_A_DESCRIPTION_COURTE +
        precedente.agrandissement +
        ECART_ENTRE_LIGNES
      : HAUT_DE_LA_PREMIERE_LIGNE;
    return [
      ...lignes,
      { y, agrandissement: agrandissementDeLaLigne(exigence) },
    ];
  }, []);

const BAS_DES_EXIGENCES_RESTANTES = 9786938 - 114300;

const tiennentSurLaPage = (exigences: ExigenceRestante[]) => {
  const derniere = disposeLesLignes(exigences)[exigences.length - 1];
  return (
    exigences.length <= NOMBRE_DE_LIGNES_D_EXIGENCES &&
    derniere.y +
      HAUTEUR_D_UNE_LIGNE_A_DESCRIPTION_COURTE +
      derniere.agrandissement <=
      BAS_DES_EXIGENCES_RESTANTES
  );
};

const placeLaLigne = (
  slide: ISlide,
  forme: (partie: string) => string,
  { y, agrandissement }: DispositionDUneLigne
) => {
  const place = (partie: string, position: { y: number; h?: number }) =>
    slide.modifyElement(forme(partie), modify.setPosition(position));
  ['fond-mesure', 'fond-statut', 'fond-echeance', 'fond-porteurs'].forEach(
    (partie) =>
      place(partie, {
        y,
        h: HAUTEUR_D_UNE_LIGNE_A_DESCRIPTION_COURTE + agrandissement,
      })
  );
  place('description', {
    y: y + HAUT_DE_LA_DESCRIPTION,
    h: HAUTEUR_D_UNE_DESCRIPTION_COURTE + agrandissement,
  });
  const hautDeLaPastille =
    y +
    Math.round(
      (HAUTEUR_D_UNE_LIGNE_A_DESCRIPTION_COURTE +
        agrandissement -
        HAUTEUR_DE_LA_PASTILLE_DU_STATUT) /
        2
    );
  place('statut-fond', { y: hautDeLaPastille });
  place('statut-texte', {
    y: hautDeLaPastille + DECALAGE_DU_TEXTE_DANS_LA_PASTILLE_DU_STATUT,
  });
  ['echeance', 'porteurs'].forEach((partie) =>
    place(partie, {
      y: y + HAUT_DES_CELLULES_CENTREES,
      h: HAUTEUR_DES_CELLULES_CENTREES_A_DESCRIPTION_COURTE + agrandissement,
    })
  );
};

const PASTILLES_DES_STATUTS: Record<
  ExigenceRestante['statut'],
  { libelle: string; texte: string; fond: string; largeur: number }
> = {
  enCours: {
    libelle: 'PARTIELLE',
    texte: '0079D0',
    fond: 'DBEEFF',
    largeur: 1519758,
  },
  aLancer: {
    libelle: 'À LANCER',
    texte: '7025DA',
    fond: 'E9DDFF',
    largeur: 1447800,
  },
};

const ecrisLaLigne = (
  slide: ISlide,
  forme: (partie: string) => string,
  { description, statut, cartouches, echeance, porteurs }: ExigenceRestante,
  disposition: DispositionDUneLigne
) => {
  slide.modifyElement(forme('description'), modify.setText(description));
  ecrisLesCartouches(slide, forme, cartouches, disposition);
  const pastille = PASTILLES_DES_STATUTS[statut];
  slide.modifyElement(forme('statut-texte'), [
    modify.setText(pastille.libelle),
    coloreLeTexte(pastille.texte),
  ]);
  slide.modifyElement(forme('statut-fond'), [
    colore(pastille.fond),
    modify.setPosition({ w: pastille.largeur }),
  ]);
  slide.modifyElement(forme('echeance'), modify.setText(echeance ?? ''));
  slide.modifyElement(forme('porteurs'), modify.setText(porteurs ?? ''));
};

const ecrisLesLignes = (slide: ISlide, exigences: ExigenceRestante[]) => {
  const lignes = disposeLesLignes(exigences);
  Array.from(
    { length: NOMBRE_DE_LIGNES_D_EXIGENCES },
    (_, index) => index + 1
  ).forEach((numeroLigne) => {
    const exigence = exigences[numeroLigne - 1];
    const forme = (partie: string) => `exigence-${numeroLigne}-${partie}`;
    if (!exigence) {
      PARTIES_D_UNE_LIGNE_D_EXIGENCE.forEach((partie) =>
        slide.removeElement(forme(partie))
      );
      return;
    }
    placeLaLigne(slide, forme, lignes[numeroLigne - 1]);
    ecrisLaLigne(slide, forme, exigence, lignes[numeroLigne - 1]);
  });
};

export const ajouteLesExigencesRestantes = (
  presentation: Automizer,
  exigences: ExigenceRestante[]
) => {
  const pages = decoupeEnPagesALaHauteur(exigences, tiennentSurLaPage);
  pages.forEach((exigencesDeLaPage, index) => {
    presentation.addSlide(MODELE, SLIDE_EXIGENCES_RESTANTES, (slide) => {
      ecrisNumeroDePage(
        slide,
        'exigences-restantes-titre',
        index + 1,
        pages.length
      );
      ecrisLesLignes(slide, exigencesDeLaPage);
    });
  });
};

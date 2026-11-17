import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_AVIS_DES_MEMBRES } from '../template.js';
import { decoupeEnPagesALaHauteur } from '../pagination.js';
import { ecrisNumeroDePage } from '../formes.js';
import { AvisDUnMembre } from '../../../modeles/objetsPowerpoint/avisDesMembres.js';
import {
  changeLaTailleDePolice,
  nombreDeLignesALaLargeurEnArial,
  unParagrapheParLigne,
} from '../texte.js';

const NOMBRE_DE_CARTES_DU_MODELE = 4;
const PARTIES_D_UNE_CARTE = [
  'carte',
  'bandeau',
  'membres',
  'libelle-avis',
  'avis',
  'libelle-duree',
  'duree',
  'libelle-commentaire',
  'commentaire',
];
const FONDS_D_UNE_CARTE = ['carte', 'bandeau'];

const EMPLACEMENTS_PAR_PAGE = 4;
const X_DU_PREMIER_EMPLACEMENT = 838200;
const LARGEUR_D_UN_EMPLACEMENT = 3952875;
const ECART_ENTRE_LES_CARTES = 266700;

const largeurDUneCarte = (emplacements: number) =>
  emplacements * LARGEUR_D_UN_EMPLACEMENT +
  (emplacements - 1) * ECART_ENTRE_LES_CARTES;

const xDeLEmplacement = (emplacement: number) =>
  X_DU_PREMIER_EMPLACEMENT +
  emplacement * (LARGEUR_D_UN_EMPLACEMENT + ECART_ENTRE_LES_CARTES);

const LARGEUR_D_UNE_CARTE_DU_MODELE = largeurDUneCarte(1);

const HAUT_DES_MEMBRES = 2718420;
const BAS_DES_CARTES = 2394570 + 6939930;
const MARGE_DANS_LA_CARTE = 266700;
const MARGES_INTERNES_D_UN_TEXTE = 2 * 25400;

const ECART_SOUS_UNE_VALEUR = 228600;
const ECART_SOUS_UN_LIBELLE = 38100;
const HAUTEUR_D_UN_LIBELLE = 300038;

type TexteDUneCarte = {
  tailleEnPoints: number;
  hauteurSurUneLigne: number;
  hauteurDUneLigneDePlus: number;
};

const MEMBRES: TexteDUneCarte = {
  tailleEnPoints: 22.5,
  hauteurSurUneLigne: 395288,
  hauteurDUneLigneDePlus: 355880,
};

const VALEUR: TexteDUneCarte = {
  tailleEnPoints: 18,
  hauteurSurUneLigne: 300038,
  hauteurDUneLigneDePlus: 261937,
};

const TAILLES_DU_COMMENTAIRE = [18, 16, 14];
const PLUS_PETITE_TAILLE_DU_COMMENTAIRE =
  TAILLES_DU_COMMENTAIRE[TAILLES_DU_COMMENTAIRE.length - 1];
const HAUTEUR_D_UNE_LIGNE_SIMPLE_PAR_POINT =
  VALEUR.hauteurDUneLigneDePlus / VALEUR.tailleEnPoints;
const INTERLIGNE_DU_COMMENTAIRE = 1.17818;

const largeurDesTextes = (largeurDeLaCarte: number) =>
  largeurDeLaCarte - 2 * MARGE_DANS_LA_CARTE;

const largeurUtileDesTextes = (largeurDeLaCarte: number) =>
  largeurDesTextes(largeurDeLaCarte) - MARGES_INTERNES_D_UN_TEXTE;

const hauteurDuTexte = (
  texte: string,
  {
    tailleEnPoints,
    hauteurSurUneLigne,
    hauteurDUneLigneDePlus,
  }: TexteDUneCarte,
  largeurDeLaCarte: number
) =>
  hauteurSurUneLigne +
  (nombreDeLignesALaLargeurEnArial(
    texte,
    largeurUtileDesTextes(largeurDeLaCarte),
    tailleEnPoints
  ) -
    1) *
    hauteurDUneLigneDePlus;

type PositionDUnTexte = { partie: string; y: number; h: number };

type DispositionDUneCarte = {
  positions: PositionDUnTexte[];
  hauteurDuCommentaire: number;
};

const empileLesTextes = (hauteurs: [string, number][]) =>
  hauteurs.reduce<PositionDUnTexte[]>((positions, [partie, h]) => {
    const precedent = positions[positions.length - 1];
    if (!precedent) return [{ partie, y: HAUT_DES_MEMBRES, h }];
    const ecart = precedent.partie.startsWith('libelle-')
      ? ECART_SOUS_UN_LIBELLE
      : ECART_SOUS_UNE_VALEUR;
    return [...positions, { partie, y: precedent.y + precedent.h + ecart, h }];
  }, []);

const disposeLaCarte = (
  { membres, avis, duree }: AvisDUnMembre,
  largeurDeLaCarte: number
): DispositionDUneCarte => {
  const textesAuDessusDuCommentaire = empileLesTextes([
    ['membres', hauteurDuTexte(membres, MEMBRES, largeurDeLaCarte)],
    ['libelle-avis', HAUTEUR_D_UN_LIBELLE],
    ['avis', hauteurDuTexte(avis, VALEUR, largeurDeLaCarte)],
    ['libelle-duree', HAUTEUR_D_UN_LIBELLE],
    ['duree', hauteurDuTexte(duree, VALEUR, largeurDeLaCarte)],
    ['libelle-commentaire', HAUTEUR_D_UN_LIBELLE],
  ]);
  const libelleDuCommentaire =
    textesAuDessusDuCommentaire[textesAuDessusDuCommentaire.length - 1];
  const hautDuCommentaire =
    libelleDuCommentaire.y + libelleDuCommentaire.h + ECART_SOUS_UN_LIBELLE;
  const hauteurDuCommentaire =
    BAS_DES_CARTES - MARGE_DANS_LA_CARTE - hautDuCommentaire;
  return {
    positions: [
      ...textesAuDessusDuCommentaire,
      { partie: 'commentaire', y: hautDuCommentaire, h: hauteurDuCommentaire },
    ],
    hauteurDuCommentaire,
  };
};

const commentaireTientEnPolice = (
  commentaire: string,
  taille: number,
  hauteurDuCommentaire: number,
  largeurDeLaCarte: number
) =>
  nombreDeLignesALaLargeurEnArial(
    commentaire,
    largeurUtileDesTextes(largeurDeLaCarte),
    taille
  ) *
    taille *
    HAUTEUR_D_UNE_LIGNE_SIMPLE_PAR_POINT *
    INTERLIGNE_DU_COMMENTAIRE <=
  hauteurDuCommentaire - MARGES_INTERNES_D_UN_TEXTE;

const tailleDuCommentaire = (
  commentaire: string,
  hauteurDuCommentaire: number,
  largeurDeLaCarte: number
) =>
  TAILLES_DU_COMMENTAIRE.find((taille) =>
    commentaireTientEnPolice(
      commentaire,
      taille,
      hauteurDuCommentaire,
      largeurDeLaCarte
    )
  ) ?? PLUS_PETITE_TAILLE_DU_COMMENTAIRE;

const tientDansUneCarteDuModele = (avis: AvisDUnMembre) =>
  commentaireTientEnPolice(
    avis.commentaire,
    PLUS_PETITE_TAILLE_DU_COMMENTAIRE,
    disposeLaCarte(avis, LARGEUR_D_UNE_CARTE_DU_MODELE).hauteurDuCommentaire,
    LARGEUR_D_UNE_CARTE_DU_MODELE
  );

const emplacementsDeLAvis = (avis: AvisDUnMembre) =>
  tientDansUneCarteDuModele(avis) ? 1 : 2;

const tiennentSurLaPage = (avisDeLaPage: AvisDUnMembre[]) =>
  avisDeLaPage.reduce(
    (emplacements, avis) => emplacements + emplacementsDeLAvis(avis),
    0
  ) <= EMPLACEMENTS_PAR_PAGE;

const placeLaCarte = (
  slide: ISlide,
  forme: (partie: string) => string,
  x: number,
  largeurDeLaCarte: number,
  { positions }: DispositionDUneCarte
) => {
  FONDS_D_UNE_CARTE.forEach((partie) =>
    slide.modifyElement(
      forme(partie),
      modify.setPosition({ x, w: largeurDeLaCarte })
    )
  );
  positions.forEach(({ partie, y, h }) =>
    slide.modifyElement(
      forme(partie),
      modify.setPosition({
        x: x + MARGE_DANS_LA_CARTE,
        y,
        w: largeurDesTextes(largeurDeLaCarte),
        h,
      })
    )
  );
};

const ecrisLaCarte = (
  slide: ISlide,
  forme: (partie: string) => string,
  { membres, avis, duree, commentaire }: AvisDUnMembre,
  largeurDeLaCarte: number,
  { hauteurDuCommentaire }: DispositionDUneCarte
) => {
  slide.modifyElement(forme('membres'), modify.setText(membres));
  slide.modifyElement(forme('avis'), modify.setText(avis));
  slide.modifyElement(forme('duree'), modify.setText(duree));
  slide.modifyElement(forme('commentaire'), [
    modify.setText(commentaire),
    unParagrapheParLigne,
    changeLaTailleDePolice(
      tailleDuCommentaire(commentaire, hauteurDuCommentaire, largeurDeLaCarte)
    ),
  ]);
};

const ecrisLesCartes = (slide: ISlide, avisDeLaPage: AvisDUnMembre[]) => {
  Array.from(
    { length: NOMBRE_DE_CARTES_DU_MODELE },
    (_, index) => index + 1
  ).reduce((emplacement, numeroCarte) => {
    const avis = avisDeLaPage[numeroCarte - 1];
    const forme = (partie: string) => `avis-${numeroCarte}-${partie}`;
    if (!avis) {
      PARTIES_D_UNE_CARTE.forEach((partie) =>
        slide.removeElement(forme(partie))
      );
      return emplacement;
    }
    const emplacements = emplacementsDeLAvis(avis);
    const largeurDeLaCarte = largeurDUneCarte(emplacements);
    const disposition = disposeLaCarte(avis, largeurDeLaCarte);
    placeLaCarte(
      slide,
      forme,
      xDeLEmplacement(emplacement),
      largeurDeLaCarte,
      disposition
    );
    ecrisLaCarte(slide, forme, avis, largeurDeLaCarte, disposition);
    return emplacement + emplacements;
  }, 0);
};

export const ajouteLesAvisDesMembres = (
  presentation: Automizer,
  avisDesMembres: AvisDUnMembre[]
) => {
  const pages = decoupeEnPagesALaHauteur(avisDesMembres, tiennentSurLaPage);
  pages.forEach((avisDeLaPage, index) =>
    presentation.addSlide(MODELE, SLIDE_AVIS_DES_MEMBRES, (slide) => {
      ecrisNumeroDePage(slide, 'avis-titre', index + 1, pages.length);
      if (avisDesMembres.length > 0) slide.removeElement('aucun-avis');
      ecrisLesCartes(slide, avisDeLaPage);
    })
  );
};

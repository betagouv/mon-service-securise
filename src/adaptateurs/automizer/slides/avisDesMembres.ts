import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_AVIS_DES_MEMBRES } from '../template.js';
import { AvisDUnMembre } from '../../../modeles/objetsPowerpoint/avisDesMembres.js';
import {
  changeLaTailleDePolice,
  nombreDeLignesALaLargeurEnArial,
  unParagrapheParLigne,
} from '../texte.js';

const NOMBRE_DE_CARTES = 4;
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

const HAUT_DES_MEMBRES = 2718420;
const BAS_DES_CARTES = 2394570 + 6939930;
const MARGE_DANS_LA_CARTE = 266700;
const LARGEUR_DU_TEXTE_DANS_LA_CARTE = 3952875 - 2 * MARGE_DANS_LA_CARTE;
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
const HAUTEUR_D_UNE_LIGNE_SIMPLE_PAR_POINT =
  VALEUR.hauteurDUneLigneDePlus / VALEUR.tailleEnPoints;
const INTERLIGNE_DU_COMMENTAIRE = 1.17818;

const LARGEUR_UTILE_DU_TEXTE =
  LARGEUR_DU_TEXTE_DANS_LA_CARTE - MARGES_INTERNES_D_UN_TEXTE;

const tailleDuCommentaire = (commentaire: string, hauteur: number) => {
  const tient = (taille: number) =>
    nombreDeLignesALaLargeurEnArial(
      commentaire,
      LARGEUR_UTILE_DU_TEXTE,
      taille
    ) *
      taille *
      HAUTEUR_D_UNE_LIGNE_SIMPLE_PAR_POINT *
      INTERLIGNE_DU_COMMENTAIRE <=
    hauteur - MARGES_INTERNES_D_UN_TEXTE;
  return (
    TAILLES_DU_COMMENTAIRE.find(tient) ??
    TAILLES_DU_COMMENTAIRE[TAILLES_DU_COMMENTAIRE.length - 1]
  );
};

const hauteurDuTexte = (
  texte: string,
  { tailleEnPoints, hauteurSurUneLigne, hauteurDUneLigneDePlus }: TexteDUneCarte
) =>
  hauteurSurUneLigne +
  (nombreDeLignesALaLargeurEnArial(
    texte,
    LARGEUR_UTILE_DU_TEXTE,
    tailleEnPoints
  ) -
    1) *
    hauteurDUneLigneDePlus;

const placeLaCarte = (
  slide: ISlide,
  forme: (partie: string) => string,
  { membres, avis, duree }: AvisDUnMembre
) => {
  const place = (partie: string, y: number, h: number) => {
    slide.modifyElement(forme(partie), modify.setPosition({ y, h }));
    return y + h;
  };
  const placeLaValeurEtSonLibelle = (
    partie: string,
    hautDuLibelle: number,
    hauteurDeLaValeur: number
  ) =>
    place(
      partie,
      place(`libelle-${partie}`, hautDuLibelle, HAUTEUR_D_UN_LIBELLE) +
        ECART_SOUS_UN_LIBELLE,
      hauteurDeLaValeur
    ) + ECART_SOUS_UNE_VALEUR;

  const basDesMembres = place(
    'membres',
    HAUT_DES_MEMBRES,
    hauteurDuTexte(membres, MEMBRES)
  );
  const basDeLAvis = placeLaValeurEtSonLibelle(
    'avis',
    basDesMembres + ECART_SOUS_UNE_VALEUR,
    hauteurDuTexte(avis, VALEUR)
  );
  const basDeLaDuree = placeLaValeurEtSonLibelle(
    'duree',
    basDeLAvis,
    hauteurDuTexte(duree, VALEUR)
  );
  const hautDuCommentaire =
    place('libelle-commentaire', basDeLaDuree, HAUTEUR_D_UN_LIBELLE) +
    ECART_SOUS_UN_LIBELLE;
  const hauteurDuCommentaire =
    BAS_DES_CARTES - MARGE_DANS_LA_CARTE - hautDuCommentaire;
  place('commentaire', hautDuCommentaire, hauteurDuCommentaire);
  return { hauteurDuCommentaire };
};

const ecrisLaCarte = (
  slide: ISlide,
  forme: (partie: string) => string,
  { membres, avis, duree, commentaire }: AvisDUnMembre,
  { hauteurDuCommentaire }: { hauteurDuCommentaire: number }
) => {
  slide.modifyElement(forme('membres'), modify.setText(membres));
  slide.modifyElement(forme('avis'), modify.setText(avis));
  slide.modifyElement(forme('duree'), modify.setText(duree));
  slide.modifyElement(forme('commentaire'), [
    modify.setText(commentaire),
    unParagrapheParLigne,
    changeLaTailleDePolice(
      tailleDuCommentaire(commentaire, hauteurDuCommentaire)
    ),
  ]);
};

export const ajouteLesAvisDesMembres = (
  presentation: Automizer,
  avisDesMembres: AvisDUnMembre[]
) => {
  presentation.addSlide(MODELE, SLIDE_AVIS_DES_MEMBRES, (slide) => {
    Array.from({ length: NOMBRE_DE_CARTES }, (_, index) => index + 1).forEach(
      (numeroCarte) => {
        const avis = avisDesMembres[numeroCarte - 1];
        const forme = (partie: string) => `avis-${numeroCarte}-${partie}`;
        if (!avis) {
          PARTIES_D_UNE_CARTE.forEach((partie) =>
            slide.removeElement(forme(partie))
          );
          return;
        }
        const disposition = placeLaCarte(slide, forme, avis);
        ecrisLaCarte(slide, forme, avis, disposition);
      }
    );
  });
};

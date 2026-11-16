import { XmlElement } from 'pptx-automizer';

const nombreDeLignesDUnParagraphe = (
  paragraphe: string,
  caracteresParLigne: number
) =>
  paragraphe.split(' ').reduce(
    ({ lignes, longueurLigneCourante }, mot) => {
      const longueurAvecLeMot =
        longueurLigneCourante === 0
          ? mot.length
          : longueurLigneCourante + 1 + mot.length;
      return longueurAvecLeMot > caracteresParLigne
        ? { lignes: lignes + 1, longueurLigneCourante: mot.length }
        : { lignes, longueurLigneCourante: longueurAvecLeMot };
    },
    { lignes: 1, longueurLigneCourante: 0 }
  ).lignes;

export const nombreDeLignesDeTexte = (
  texte: string,
  caracteresParLigne: number
) =>
  texte
    .split(/\r?\n/)
    .reduce(
      (lignes, paragraphe) =>
        lignes + nombreDeLignesDUnParagraphe(paragraphe, caracteresParLigne),
      0
    );

export type Police = {
  taille: number;
  caracteresParLigne: number;
  lignes: number;
};

export const changeLaTailleDePolice =
  (taille: number) => (forme: XmlElement) => {
    ['a:rPr', 'a:endParaRPr'].forEach((balise) => {
      Array.from(forme.getElementsByTagName(balise)).forEach((proprietes) =>
        proprietes.setAttribute('sz', String(taille * 100))
      );
    });
  };

export const unParagrapheParLigne = (forme: XmlElement) => {
  const [paragraphe] = Array.from(forme.getElementsByTagName('a:p'));
  const [texte] = Array.from(paragraphe.getElementsByTagName('a:t'));
  (texte.textContent ?? '').split(/\r?\n/).forEach((ligne) => {
    const paragrapheDeLaLigne = paragraphe.cloneNode(true) as XmlElement;
    paragrapheDeLaLigne.getElementsByTagName('a:t')[0].textContent = ligne;
    paragraphe.parentNode!.insertBefore(paragrapheDeLaLigne, paragraphe);
  });
  paragraphe.parentNode!.removeChild(paragraphe);
};

export const tientDansLaPolice = (
  texte: string,
  { caracteresParLigne, lignes }: Police
) => nombreDeLignesDeTexte(texte, caracteresParLigne) <= lignes;

export const policeQuiConvient = (texte: string, polices: Police[]) =>
  polices.find((police) => tientDansLaPolice(texte, police)) ??
  polices[polices.length - 1];

export const auDixieme = new Intl.NumberFormat('fr', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
}).format;

const LARGEURS_ARIAL_EN_MILLIEMES_DE_CADRATIN: Record<string, number> = {
  ...Object.fromEntries(
    [...'0123456789#'].map((caractere) => [caractere, 556])
  ),
  ' ': 278,
  '.': 278,
  ',': 278,
  ':': 278,
  '-': 333,
  '(': 333,
  ')': 333,
  "'": 191,
  '’': 222,
  A: 667,
  B: 667,
  C: 722,
  D: 722,
  E: 667,
  F: 611,
  G: 778,
  H: 722,
  I: 278,
  J: 500,
  K: 667,
  L: 556,
  M: 833,
  N: 722,
  O: 778,
  P: 667,
  Q: 778,
  R: 722,
  S: 667,
  T: 611,
  U: 722,
  V: 667,
  W: 944,
  X: 667,
  Y: 667,
  Z: 611,
  a: 556,
  b: 556,
  c: 500,
  d: 556,
  e: 556,
  f: 278,
  g: 556,
  h: 556,
  i: 222,
  j: 222,
  k: 500,
  l: 222,
  m: 833,
  n: 556,
  o: 556,
  p: 556,
  q: 556,
  r: 333,
  s: 500,
  t: 278,
  u: 556,
  v: 500,
  w: 722,
  x: 500,
  y: 500,
  z: 500,
  œ: 944,
  Œ: 1000,
};
const LARGEUR_ARIAL_PAR_DEFAUT = 556;
const EMU_PAR_POINT = 12700;

const sansAccent = (caractere: string) =>
  caractere.normalize('NFD').replace(/\p{Diacritic}/gu, '');

export const largeurDuTexteEnArial = (texte: string, tailleEnPoints: number) =>
  Math.round(
    ([...texte].reduce(
      (somme, caractere) =>
        somme +
        (LARGEURS_ARIAL_EN_MILLIEMES_DE_CADRATIN[sansAccent(caractere)] ??
          LARGEUR_ARIAL_PAR_DEFAUT),
      0
    ) *
      tailleEnPoints *
      EMU_PAR_POINT) /
      1000
  );

export const nombreDeLignesALaLargeurEnArial = (
  texte: string,
  largeurDisponible: number,
  tailleEnPoints: number
) =>
  texte.split(/\r?\n/).reduce((lignes, paragraphe) => {
    const { lignesDuParagraphe } = paragraphe.split(' ').reduce(
      ({ lignesDuParagraphe: nombre, ligneCourante }, mot) => {
        const ligneAvecLeMot =
          ligneCourante === '' ? mot : `${ligneCourante} ${mot}`;
        const depasse =
          ligneCourante !== '' &&
          largeurDuTexteEnArial(ligneAvecLeMot, tailleEnPoints) >
            largeurDisponible;
        return depasse
          ? { lignesDuParagraphe: nombre + 1, ligneCourante: mot }
          : { lignesDuParagraphe: nombre, ligneCourante: ligneAvecLeMot };
      },
      { lignesDuParagraphe: 1, ligneCourante: '' }
    );
    return lignes + lignesDuParagraphe;
  }, 0);

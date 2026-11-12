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

import { ISlide, modify, XmlDocument, XmlElement } from 'pptx-automizer';

export const renommeLaForme = (nom: string) => (forme: XmlElement) => {
  forme.getElementsByTagName('p:cNvPr')[0].setAttribute('name', nom);
};

export const donneDesIdentifiantsUniquesAuxFormes = (slide: XmlDocument) => {
  const proprietesDesFormes = Array.from(slide.getElementsByTagName('p:cNvPr'));
  let prochainIdentifiantLibre =
    Math.max(
      ...proprietesDesFormes.map((proprietes) =>
        Number(proprietes.getAttribute('id'))
      )
    ) + 1;
  const identifiantsVus = new Set<string>();
  proprietesDesFormes.forEach((proprietes) => {
    const identifiant = proprietes.getAttribute('id')!;
    if (identifiantsVus.has(identifiant)) {
      proprietes.setAttribute('id', String(prochainIdentifiantLibre));
      prochainIdentifiantLibre += 1;
    } else identifiantsVus.add(identifiant);
  });
};

export const colore = (couleur: string) => (forme: XmlElement) => {
  const [proprietes] = Array.from(forme.getElementsByTagName('p:spPr'));
  proprietes.getElementsByTagName('a:srgbClr')[0].setAttribute('val', couleur);
};

export const pointeLImageSur =
  (fichier: string) => (image: XmlElement, relation?: XmlElement) =>
    modify.setRelationTarget(fichier)(image, relation!);

export const ecrisNumeroDePage = (
  slide: ISlide,
  formeDuTitre: string,
  numeroPage: number,
  nombrePages: number
) => {
  const numerotation = nombrePages > 1 ? ` ${numeroPage}/${nombrePages}` : '';
  slide.modifyElement(
    formeDuTitre,
    modify.replaceText({ replace: 'pagination', by: { text: numerotation } })
  );
};

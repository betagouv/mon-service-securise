import JSZip from 'jszip';

const lisFichier = (archive: JSZip, chemin: string) =>
  archive.file(chemin)!.async('string');

const cheminsDesSlidesDansLOrdre = async (archive: JSZip) => {
  const presentation = await lisFichier(archive, 'ppt/presentation.xml');
  const relations = await lisFichier(
    archive,
    'ppt/_rels/presentation.xml.rels'
  );

  return [...presentation.matchAll(/<p:sldId [^>]*r:id="([^"]+)"/g)].map(
    ([, idRelation]) => {
      const [, cible] = relations.match(
        new RegExp(`Id="${idRelation}"[^>]*Target="([^"]+)"`)
      )!;
      return `ppt/${cible}`;
    }
  );
};

export const nombreDeSlides = async (pptx: Buffer) => {
  const archive = await JSZip.loadAsync(pptx);
  return (await cheminsDesSlidesDansLOrdre(archive)).length;
};

export const contenuSlide = async (pptx: Buffer, position: number) => {
  const archive = await JSZip.loadAsync(pptx);
  const chemins = await cheminsDesSlidesDansLOrdre(archive);
  return lisFichier(archive, chemins[position - 1]);
};

export const partiesDeclarees = async (pptx: Buffer) => {
  const archive = await JSZip.loadAsync(pptx);
  const typesDeContenu = await lisFichier(archive, '[Content_Types].xml');
  return [...typesDeContenu.matchAll(/<Override [^>]*PartName="([^"]+)"/g)].map(
    ([, partie]) => partie
  );
};

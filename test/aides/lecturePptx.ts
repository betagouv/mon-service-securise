import JSZip from 'jszip';

const lisFichier = (archive: JSZip, chemin: string) =>
  archive.file(chemin)!.async('string');

export const contenuSlide = async (pptx: Buffer, position: number) => {
  const archive = await JSZip.loadAsync(pptx);
  const presentation = await lisFichier(archive, 'ppt/presentation.xml');
  const relations = await lisFichier(
    archive,
    'ppt/_rels/presentation.xml.rels'
  );

  const idsRelationsDesSlides = [
    ...presentation.matchAll(/<p:sldId [^>]*r:id="([^"]+)"/g),
  ].map(([, idRelation]) => idRelation);
  const idRelation = idsRelationsDesSlides[position - 1];
  const [, cible] = relations.match(
    new RegExp(`Id="${idRelation}"[^>]*Target="([^"]+)"`)
  )!;

  return lisFichier(archive, `ppt/${cible}`);
};

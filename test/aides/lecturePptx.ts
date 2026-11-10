import JSZip from 'jszip';
import path from 'node:path';

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

const dossierSourceDesRelations = (cheminDesRelations: string) =>
  path.posix.dirname(path.posix.dirname(cheminDesRelations));

export const relationsCassees = async (pptx: Buffer) => {
  const archive = await JSZip.loadAsync(pptx);
  const fichiersDeRelations = Object.keys(archive.files).filter((chemin) =>
    chemin.endsWith('.rels')
  );

  const relationsParFichier = await Promise.all(
    fichiersDeRelations.map(async (fichier) => ({
      fichier,
      relations: await lisFichier(archive, fichier),
    }))
  );

  return relationsParFichier.flatMap(({ fichier, relations }) =>
    [...relations.matchAll(/<Relationship [^>]*>/g)]
      .map(([relation]) => relation)
      .filter((relation) => !relation.includes('TargetMode="External"'))
      .map((relation) => relation.match(/Target="([^"]+)"/)![1])
      .filter((cible) => {
        const chemin = cible.startsWith('/')
          ? cible.slice(1)
          : path.posix.join(dossierSourceDesRelations(fichier), cible);
        return !archive.file(chemin);
      })
      .map((cible) => `${fichier} -> ${cible}`)
  );
};

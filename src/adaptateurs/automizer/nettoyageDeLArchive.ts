import JSZip from 'jszip';
import path from 'node:path';

const partieSourceDesRelations = (cheminDesRelations: string) =>
  path.posix.join(
    path.posix.dirname(path.posix.dirname(cheminDesRelations)),
    path.posix.basename(cheminDesRelations, '.rels')
  );

const relationsDeLaPartie = (cheminDeLaPartie: string) =>
  path.posix.join(
    path.posix.dirname(cheminDeLaPartie),
    '_rels',
    `${path.posix.basename(cheminDeLaPartie)}.rels`
  );

const slideDeLaNote = async (archive: JSZip, note: string) => {
  const relations = archive.file(relationsDeLaPartie(note));
  const contenu = relations ? await relations.async('string') : '';
  const [, slide] = contenu.match(/Target="\.\.\/slides\/([^"]+)"/) ?? [];
  return slide && `ppt/slides/${slide}`;
};

const notesDontLaSlideAEteRetiree = async (archive: JSZip) => {
  const notes = archive
    .file(/^ppt\/notesSlides\/notesSlide\d+\.xml$/)
    .map(({ name }) => name);
  const slides = await Promise.all(
    notes.map((note) => slideDeLaNote(archive, note))
  );
  return notes.filter((_, index) => {
    const slide = slides[index];
    return !slide || !archive.file(slide);
  });
};

const retireLesPartiesDesSlidesRetirees = async (archive: JSZip) => {
  (await notesDontLaSlideAEteRetiree(archive)).forEach((note) =>
    archive.remove(note)
  );
  archive
    .file(/\/_rels\/[^/]+\.rels$/)
    .filter(
      (relations) =>
        relations.name.startsWith('ppt/') &&
        !archive.file(partieSourceDesRelations(relations.name))
    )
    .forEach((relations) => archive.remove(relations.name));
};

const RELATION_D_IMAGE =
  /<Relationship [^>]*Id="([^"]+)"[^>]*Type="[^"]*\/image"[^>]*\/>/g;

const retireLesRelationsDImagesInutiliseesDUneSlide = async (
  archive: JSZip,
  slide: string
) => {
  const cheminDesRelations = relationsDeLaPartie(slide);
  const fichierDesRelations = archive.file(cheminDesRelations);
  if (!fichierDesRelations) return;
  const contenuDeLaSlide = await archive.file(slide)!.async('string');
  const relations = await fichierDesRelations.async('string');
  archive.file(
    cheminDesRelations,
    relations.replace(RELATION_D_IMAGE, (relation, idRelation) =>
      contenuDeLaSlide.includes(`"${idRelation}"`) ? relation : ''
    )
  );
};

const retireLesRelationsDImagesInutilisees = async (archive: JSZip) => {
  const slides = archive
    .file(/^ppt\/slides\/slide\d+\.xml$/)
    .map(({ name }) => name);
  await Promise.all(
    slides.map((slide) =>
      retireLesRelationsDImagesInutiliseesDUneSlide(archive, slide)
    )
  );
};

const TYPES_DE_CONTENU = '[Content_Types].xml';

const retireLesDeclarationsDesPartiesAbsentes = async (archive: JSZip) => {
  const typesDeContenu = await archive.file(TYPES_DE_CONTENU)!.async('string');
  const sansPartiesAbsentes = typesDeContenu.replace(
    /<Override [^>]*PartName="\/([^"]+)"[^>]*\/>/g,
    (declaration, partie) => (archive.file(partie) ? declaration : '')
  );
  archive.file(TYPES_DE_CONTENU, sansPartiesAbsentes);
};

export const nettoieLArchive = async (archive: JSZip) => {
  await retireLesPartiesDesSlidesRetirees(archive);
  await retireLesRelationsDImagesInutilisees(archive);
  await retireLesDeclarationsDesPartiesAbsentes(archive);
};

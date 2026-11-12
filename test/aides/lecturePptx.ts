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

export const partiesDeclareesAbsentes = async (pptx: Buffer) => {
  const archive = await JSZip.loadAsync(pptx);
  return (await partiesDeclarees(pptx)).filter(
    (partie) => !archive.file(partie.slice(1))
  );
};

const SIGNATURE_ENTREE_REPERTOIRE_CENTRAL = 0x02014b50;
const METHODE_SANS_COMPRESSION = 0;

export const fichiersNonCompresses = (pptx: Buffer) => {
  const nonCompresses: string[] = [];
  let position = pptx.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  while (
    position >= 0 &&
    pptx.readUInt32LE(position) === SIGNATURE_ENTREE_REPERTOIRE_CENTRAL
  ) {
    const methode = pptx.readUInt16LE(position + 10);
    const tailleNonCompressee = pptx.readUInt32LE(position + 24);
    const longueurNom = pptx.readUInt16LE(position + 28);
    const longueurExtra = pptx.readUInt16LE(position + 30);
    const longueurCommentaire = pptx.readUInt16LE(position + 32);
    const nom = pptx.toString(
      'utf8',
      position + 46,
      position + 46 + longueurNom
    );
    if (methode === METHODE_SANS_COMPRESSION && tailleNonCompressee > 0) {
      nonCompresses.push(nom);
    }
    position += 46 + longueurNom + longueurExtra + longueurCommentaire;
  }
  return nonCompresses;
};

export const identifiantsDeFormesEnDouble = async (pptx: Buffer) => {
  const archive = await JSZip.loadAsync(pptx);
  const chemins = await cheminsDesSlidesDansLOrdre(archive);
  const slides = await Promise.all(
    chemins.map(async (chemin) => ({
      chemin,
      xml: await lisFichier(archive, chemin),
    }))
  );
  return slides.flatMap(({ chemin, xml }) => {
    const identifiants = [...xml.matchAll(/<p:cNvPr id="(\d+)"/g)].map(
      ([, identifiant]) => identifiant
    );
    return [
      ...new Set(
        identifiants.filter(
          (identifiant, index) => identifiants.indexOf(identifiant) !== index
        )
      ),
    ].map((identifiant) => `${chemin} : ${identifiant}`);
  });
};

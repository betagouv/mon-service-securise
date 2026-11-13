import JSZip from 'jszip';
import { JSDOM } from 'jsdom';
import path from 'node:path';

const parseurXml = new new JSDOM().window.DOMParser();

const lisFichier = (archive: JSZip, chemin: string) =>
  archive.file(chemin)!.async('string');

const lisXml = async (archive: JSZip, chemin: string) =>
  parseurXml.parseFromString(await lisFichier(archive, chemin), 'text/xml');

const elements = (parent: Document | Element, balise: string) =>
  Array.from(parent.getElementsByTagName(balise));

const cibleDeLaRelation = (relations: Document, idRelation: string) =>
  elements(relations, 'Relationship')
    .find((relation) => relation.getAttribute('Id') === idRelation)!
    .getAttribute('Target')!;

const parentDeBalise = (element: Element, balise: string) => {
  let parent = element.parentElement;
  while (parent && parent.tagName !== balise) parent = parent.parentElement;
  return parent!;
};

const cheminsDesSlidesDansLOrdre = async (archive: JSZip) => {
  const presentation = await lisXml(archive, 'ppt/presentation.xml');
  const relations = await lisXml(archive, 'ppt/_rels/presentation.xml.rels');

  return elements(presentation, 'p:sldId').map(
    (slide) =>
      `ppt/${cibleDeLaRelation(relations, slide.getAttribute('r:id')!)}`
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
  const typesDeContenu = await lisXml(archive, '[Content_Types].xml');
  return elements(typesDeContenu, 'Override').map((declaration) =>
    declaration.getAttribute('PartName')!
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
      relations: await lisXml(archive, fichier),
    }))
  );

  return relationsParFichier.flatMap(({ fichier, relations }) =>
    elements(relations, 'Relationship')
      .filter((relation) => relation.getAttribute('TargetMode') !== 'External')
      .map((relation) => relation.getAttribute('Target')!)
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
      xml: await lisXml(archive, chemin),
    }))
  );
  return slides.flatMap(({ chemin, xml }) => {
    const identifiants = elements(xml, 'p:cNvPr').map((proprietes) =>
      proprietes.getAttribute('id')!
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

export const imageDeLaForme = async (
  pptx: Buffer,
  position: number,
  nom: string
) => {
  const archive = await JSZip.loadAsync(pptx);
  const chemin = (await cheminsDesSlidesDansLOrdre(archive))[position - 1];
  const slide = await lisXml(archive, chemin);
  const proprietesDeLImage = elements(slide, 'p:cNvPr').find(
    (proprietes) => proprietes.getAttribute('name') === nom
  )!;
  const [image] = elements(
    parentDeBalise(proprietesDeLImage, 'p:pic'),
    'a:blip'
  );
  const relations = await lisXml(
    archive,
    `${path.posix.dirname(chemin)}/_rels/${path.posix.basename(chemin)}.rels`
  );
  const cible = cibleDeLaRelation(relations, image.getAttribute('r:embed')!);
  return archive
    .file(path.posix.join(path.posix.dirname(chemin), cible))!
    .async('nodebuffer');
};

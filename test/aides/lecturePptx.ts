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

const formeNommeeDans = (slide: Document, nom: string) => {
  const proprietes = elements(slide, 'p:cNvPr').find(
    (candidate) => candidate.getAttribute('name') === nom
  );
  if (!proprietes) throw new Error(`Forme ${nom} absente de la slide`);
  return proprietes.parentElement!.parentElement!;
};

let derniereSlideLue: { xml: string; document: Document } | undefined;

const documentDeLaSlide = (xml: string) => {
  if (derniereSlideLue?.xml !== xml) {
    derniereSlideLue = {
      xml,
      document: parseurXml.parseFromString(xml, 'text/xml'),
    };
  }
  return derniereSlideLue.document;
};

const texteDe = (element: Element) =>
  elements(element, 'a:t')
    .map((texte) => texte.textContent)
    .join('');

export const nomsDesFormes = (slide: string) =>
  elements(documentDeLaSlide(slide), 'p:cNvPr').map((proprietes) =>
    proprietes.getAttribute('name')!
  );

export const formeNommee = (slide: string, nom: string) =>
  formeNommeeDans(documentDeLaSlide(slide), nom);

export const texteDeLaForme = (slide: string, nom: string) =>
  texteDe(formeNommee(slide, nom));

export const paragraphesDeLaForme = (slide: string, nom: string) =>
  elements(formeNommee(slide, nom), 'a:p').map(texteDe);

export const cadreDeLaForme = (slide: string, nom: string) => {
  const [positionnement] = elements(formeNommee(slide, nom), 'a:xfrm');
  const [origine] = elements(positionnement, 'a:off');
  const [etendue] = elements(positionnement, 'a:ext');
  return {
    x: Number(origine.getAttribute('x')),
    y: Number(origine.getAttribute('y')),
    largeur: Number(etendue.getAttribute('cx')),
    hauteur: Number(etendue.getAttribute('cy')),
  };
};

export const taillesDePolice = (slide: string, nom: string) =>
  elements(formeNommee(slide, nom), 'a:rPr')
    .map((proprietes) => proprietes.getAttribute('sz'))
    .filter((taille): taille is string => taille !== null);

export const couleurDuFond = (slide: string, nom: string) => {
  const [proprietes] = elements(formeNommee(slide, nom), 'p:spPr');
  const [couleur] = elements(proprietes, 'a:srgbClr');
  return couleur.getAttribute('val');
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
  const [image] = elements(formeNommeeDans(slide, nom), 'a:blip');
  const relations = await lisXml(
    archive,
    `${path.posix.dirname(chemin)}/_rels/${path.posix.basename(chemin)}.rels`
  );
  const cible = cibleDeLaRelation(relations, image.getAttribute('r:embed')!);
  return archive
    .file(path.posix.join(path.posix.dirname(chemin), cible))!
    .async('nodebuffer');
};

import {
  Automizer,
  ISlide,
  modify,
  XmlDocument,
  XmlElement,
} from 'pptx-automizer';
import JSZip from 'jszip';
import path from 'node:path';
import {
  AdaptateurPowerpoint,
  AutoriteHomologation,
  DonneesSupportCommissionHomologation,
} from './adaptateurPowerpoint.interface.js';
import { dateEnFrancais } from '../utilitaires/date.js';
import { NiveauSecurite } from '../../donneesReferentielMesuresV2.js';
import {
  NiveauDeRisque,
  RisqueCartographie,
} from '../modeles/objetsPowerpoint/cartographiesDesRisques.js';
import { PieceDuDossier } from '../modeles/objetsPowerpoint/piecesDuDossier.js';
import {
  BesoinsDeSecurite,
  ExpositionDuService,
} from '../modeles/objetsPowerpoint/besoinsDeSecurite.js';

const NOM_TEMPLATE = 'supportCommissionHomologation.pptx';
const MODELE = 'modele';
const SLIDE_COUVERTURE = 1;
const SLIDE_SOMMAIRE = 2;
const SLIDE_PRESENTATION_DU_SYSTEME = 3;
const SLIDE_CONTEXTE = 4;
const SLIDE_PERIMETRE_VUE_FONCTIONNELLE = 5;
const SLIDE_PERIMETRE_DESCRIPTION_TECHNIQUE = 6;
const SLIDE_BESOINS_DE_SECURITE = 7;
const SLIDE_INTERCALAIRE_HISTORIQUE = 8;
const SLIDE_HISTORIQUE = 9;
const SLIDE_INTERCALAIRE_RISQUES = 10;
const SLIDE_CARTOGRAPHIE_DES_RISQUES = 11;
const SLIDE_MEMBRES_COMMISSION = 30;
const SLIDE_PAGE_PIECES = 32;
const SLIDE_PAGE_PIECES_VIDE = 31;

const FORMES_AUTORITE_A_COMPLETER = [
  'autorite-homologation-a-completer-fond',
  'autorite-homologation-a-completer-trait',
  'autorite-homologation-a-completer-texte',
];

const remplisCelluleAutoriteRenseignee = (
  slide: ISlide,
  autorite: AutoriteHomologation
) => {
  slide.modifyElement(
    'autorite-homologation',
    modify.setText(`${autorite.nom}, ${autorite.fonction}`)
  );
};

const retireCelluleAutoriteRenseignee = (slide: ISlide) => {
  slide.removeElement('autorite-homologation');
};

const retireCelluleAutoriteACompleter = (slide: ISlide) => {
  FORMES_AUTORITE_A_COMPLETER.forEach((forme) => slide.removeElement(forme));
};

const ecrisAutoriteHomologation = (
  slide: ISlide,
  autorite: AutoriteHomologation | undefined
) => {
  if (autorite) {
    remplisCelluleAutoriteRenseignee(slide, autorite);
    retireCelluleAutoriteACompleter(slide);
  } else {
    retireCelluleAutoriteRenseignee(slide);
  }
};

const NOMBRE_LIGNES_PAR_PAGE_DE_PIECES = 16;
const PARTIES_LIGNE_A_COMPLETER = [
  'intitule-fond',
  'intitule-trait',
  'intitule-texte',
  'reference-fond',
  'reference-trait',
  'reference-texte',
];

const LIGNES_PAR_COLONNE = 8;
const CARACTERES_PAR_LIGNE_D_INTITULE = 40;
const LIGNES_DE_TEXTE_MAX_D_UN_INTITULE = 3;
const PAS_D_UNE_LIGNE_DE_TEXTE = 257175;
const HAUTEUR_D_UNE_LIGNE_DE_TEXTE = 285750;
const FORMES_LIGNE_REMPLIE = ['case', 'intitule', 'source', 'separateur'];
const FORMES_LIGNE_A_COMPLETER = [
  'case',
  ...PARTIES_LIGNE_A_COMPLETER.map((partie) => `a-completer-${partie}`),
  'separateur',
];

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

const nombreDeLignesDeTexte = (
  texte: string,
  caracteresParLigne = CARACTERES_PAR_LIGNE_D_INTITULE
) =>
  texte
    .split(/\r?\n/)
    .reduce(
      (lignes, paragraphe) =>
        lignes + nombreDeLignesDUnParagraphe(paragraphe, caracteresParLigne),
      0
    );

const intituleAEcrire = (piece: PieceDuDossier) => {
  if (!piece.intituleAbrege)
    return { intitule: piece.intitule, lignesDeTexte: 1 };
  const lignesDeTexte = nombreDeLignesDeTexte(piece.intitule);
  return lignesDeTexte > LIGNES_DE_TEXTE_MAX_D_UN_INTITULE
    ? { intitule: piece.intituleAbrege, lignesDeTexte: 1 }
    : { intitule: piece.intitule, lignesDeTexte };
};

const remplisLigneAvecLaPiece = (
  slide: ISlide,
  numeroLigne: number,
  piece: PieceDuDossier,
  intitule: string
) => {
  slide.modifyElement(
    `piece-${numeroLigne}-case`,
    modify.setText(piece.cochee ? '☑' : '☐')
  );
  slide.modifyElement(
    `piece-${numeroLigne}-intitule`,
    modify.setText(intitule)
  );
  slide.modifyElement(
    `piece-${numeroLigne}-source`,
    modify.setText(piece.source)
  );
  PARTIES_LIGNE_A_COMPLETER.forEach((partie) =>
    slide.removeElement(`piece-${numeroLigne}-a-completer-${partie}`)
  );
};

const laisseLigneACompleter = (slide: ISlide, numeroLigne: number) => {
  slide.modifyElement(`piece-${numeroLigne}-case`, modify.setText('☐'));
  slide.removeElement(`piece-${numeroLigne}-intitule`);
  slide.removeElement(`piece-${numeroLigne}-source`);
};

const descendsLaLigne = (
  slide: ISlide,
  numeroLigne: number,
  formes: string[],
  decalage: number
) => {
  formes.forEach((forme) =>
    slide.modifyElement(
      `piece-${numeroLigne}-${forme}`,
      modify.updatePosition({ y: decalage })
    )
  );
};

const agrandisLaLigne = (
  slide: ISlide,
  numeroLigne: number,
  lignesDeTexteSupplementaires: number
) => {
  const agrandissement =
    lignesDeTexteSupplementaires * PAS_D_UNE_LIGNE_DE_TEXTE;
  slide.modifyElement(
    `piece-${numeroLigne}-intitule`,
    modify.updatePosition({
      h: lignesDeTexteSupplementaires * HAUTEUR_D_UNE_LIGNE_DE_TEXTE,
    })
  );
  ['case', 'source'].forEach((forme) =>
    slide.modifyElement(
      `piece-${numeroLigne}-${forme}`,
      modify.updatePosition({ y: agrandissement / 2 })
    )
  );
  slide.modifyElement(
    `piece-${numeroLigne}-separateur`,
    modify.updatePosition({ y: agrandissement })
  );
  return agrandissement;
};

const ecrisPiecesDuDossier = (slide: ISlide, pieces: PieceDuDossier[]) => {
  let decalageDansLaColonne = 0;
  for (
    let numeroLigne = 1;
    numeroLigne <= NOMBRE_LIGNES_PAR_PAGE_DE_PIECES;
    numeroLigne += 1
  ) {
    if (numeroLigne === LIGNES_PAR_COLONNE + 1) decalageDansLaColonne = 0;
    const piece = pieces[numeroLigne - 1];
    const formes = piece ? FORMES_LIGNE_REMPLIE : FORMES_LIGNE_A_COMPLETER;
    if (decalageDansLaColonne > 0) {
      descendsLaLigne(slide, numeroLigne, formes, decalageDansLaColonne);
    }
    if (piece) {
      const { intitule, lignesDeTexte } = intituleAEcrire(piece);
      remplisLigneAvecLaPiece(slide, numeroLigne, piece, intitule);
      if (lignesDeTexte > 1) {
        decalageDansLaColonne += agrandisLaLigne(
          slide,
          numeroLigne,
          lignesDeTexte - 1
        );
      }
    } else {
      laisseLigneACompleter(slide, numeroLigne);
    }
  }
};

const decoupeEnPages = (pieces: PieceDuDossier[]) => {
  const nombrePages = Math.max(
    1,
    Math.ceil(pieces.length / NOMBRE_LIGNES_PAR_PAGE_DE_PIECES)
  );
  return Array.from({ length: nombrePages }, (_, index) =>
    pieces.slice(
      index * NOMBRE_LIGNES_PAR_PAGE_DE_PIECES,
      (index + 1) * NOMBRE_LIGNES_PAR_PAGE_DE_PIECES
    )
  );
};

const laDernierePageEstPleine = (pieces: PieceDuDossier[]) =>
  pieces.length > 0 && pieces.length % NOMBRE_LIGNES_PAR_PAGE_DE_PIECES === 0;

const ecrisNumeroDePage = (
  slide: ISlide,
  numeroPage: number,
  nombrePages: number
) => {
  const numerotation = nombrePages > 1 ? ` ${numeroPage}/${nombrePages}` : '';
  slide.modifyElement(
    'titre-page-pieces',
    modify.replaceText({ replace: 'pagination', by: { text: numerotation } })
  );
};

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

type Police = {
  taille: number;
  caracteresParLigne: number;
  lignes: number;
};

const POLICES_DE_LA_DESCRIPTION: Police[] = [
  { taille: 21, caracteresParLigne: 105, lignes: 2 },
  { taille: 16, caracteresParLigne: 120, lignes: 3 },
  { taille: 14, caracteresParLigne: 130, lignes: 4 },
];

const changeLaTailleDePolice = (taille: number) => (forme: XmlElement) => {
  ['a:rPr', 'a:endParaRPr'].forEach((balise) => {
    Array.from(forme.getElementsByTagName(balise)).forEach((proprietes) =>
      proprietes.setAttribute('sz', String(taille * 100))
    );
  });
};

const unParagrapheParLigne = (forme: XmlElement) => {
  const [paragraphe] = Array.from(forme.getElementsByTagName('a:p'));
  const [texte] = Array.from(paragraphe.getElementsByTagName('a:t'));
  (texte.textContent ?? '').split(/\r?\n/).forEach((ligne) => {
    const paragrapheDeLaLigne = paragraphe.cloneNode(true) as XmlElement;
    paragrapheDeLaLigne.getElementsByTagName('a:t')[0].textContent = ligne;
    paragraphe.parentNode!.insertBefore(paragrapheDeLaLigne, paragraphe);
  });
  paragraphe.parentNode!.removeChild(paragraphe);
};

const tientDansLaPolice = (
  texte: string,
  { caracteresParLigne, lignes }: Police
) => nombreDeLignesDeTexte(texte, caracteresParLigne) <= lignes;

const policeQuiConvient = (texte: string, polices: Police[]) =>
  polices.find((police) => tientDansLaPolice(texte, police)) ??
  polices[polices.length - 1];

const coupeLaDescription = (description: string, police: Police) => {
  if (tientDansLaPolice(description, police)) return description;
  const coupeA = (position: number) =>
    `${description.slice(0, position).trimEnd()}…`;
  const finsDeMots = [...description.matchAll(/\s/g)].map(({ index }) => index);
  const derniereFinGardee =
    finsDeMots.findLast((fin) => tientDansLaPolice(coupeA(fin), police)) ?? 0;
  return coupeA(derniereFinGardee);
};

const policeDeLaDescription = (description: string) =>
  policeQuiConvient(description, POLICES_DE_LA_DESCRIPTION);

const ecrisLaDescription = (slide: ISlide, description = '') => {
  const police = policeDeLaDescription(description);
  slide.modifyElement('contexte-description', [
    modify.setText(coupeLaDescription(description, police)),
    unParagrapheParLigne,
    changeLaTailleDePolice(police.taille),
  ]);
};

const FORMES_ENCART_ANSSI = ['cadre', 'barre', 'icone', 'titre', 'texte'].map(
  (partie) => `besoins-anssi-${partie}`
);

const BAS_DU_RESUME_DU_NIVEAU = 5251772 + 929506;
const BAS_DE_L_ENCART_ANSSI = 6295579 + 1828577;
const HAUT_DU_NIVEAU = 4661222;
const ILLUSTRATION_DU_NIVEAU = {
  x: 3071812,
  y: 2918147,
  largeur: 1628775,
  hauteur: 1628775,
};
const ECART_ENTRE_ILLUSTRATION_ET_NIVEAU =
  HAUT_DU_NIVEAU - (ILLUSTRATION_DU_NIVEAU.y + ILLUSTRATION_DU_NIVEAU.hauteur);

const agrandisLIllustration = (slide: ISlide, descente: number) => {
  const { x, y, largeur, hauteur } = ILLUSTRATION_DU_NIVEAU;
  const nouvelleHauteur =
    HAUT_DU_NIVEAU + descente - ECART_ENTRE_ILLUSTRATION_ET_NIVEAU - y;
  const nouvelleLargeur = Math.round((nouvelleHauteur * largeur) / hauteur);
  const axe = x + largeur / 2;
  slide.modifyElement(
    'besoins-illustration',
    modify.setPosition({
      x: Math.round(axe - nouvelleLargeur / 2),
      y,
      w: nouvelleLargeur,
      h: nouvelleHauteur,
    })
  );
};

const occupeLaPlaceDeLEncartAnssi = (slide: ISlide) => {
  const descente = BAS_DE_L_ENCART_ANSSI - BAS_DU_RESUME_DU_NIVEAU;
  ['besoins-niveau', 'besoins-resume'].forEach((forme) =>
    slide.modifyElement(forme, modify.updatePosition({ y: descente }))
  );
  agrandisLIllustration(slide, descente);
};

const ecrisEncartAnssi = (
  slide: ISlide,
  { niveauIndicatifAnssi, depasseRecommandation }: BesoinsDeSecurite
) => {
  if (!depasseRecommandation) {
    FORMES_ENCART_ANSSI.forEach((forme) => slide.removeElement(forme));
    occupeLaPlaceDeLEncartAnssi(slide);
    return;
  }
  slide.modifyElement(
    'besoins-anssi-titre',
    modify.replaceText({
      replace: 'niveauIndicatifAnssi',
      by: { text: niveauIndicatifAnssi },
    })
  );
};

const CARACTERES_PAR_LIGNE_DE_L_OUVERTURE = 42;
const HAUTEUR_D_UNE_LIGNE_DE_L_EXPOSITION = 308595;
const FORMES_SOUS_L_OUVERTURE = [
  'exposition-audience-libelle',
  'exposition-audience',
  'exposition-duree-libelle',
  'exposition-duree',
];

const agrandisLOuvertureDUneLigne = (slide: ISlide) => {
  slide.modifyElement(
    'exposition-ouverture',
    modify.updatePosition({ h: HAUTEUR_D_UNE_LIGNE_DE_L_EXPOSITION })
  );
  FORMES_SOUS_L_OUVERTURE.forEach((forme) =>
    slide.modifyElement(
      forme,
      modify.updatePosition({ y: HAUTEUR_D_UNE_LIGNE_DE_L_EXPOSITION })
    )
  );
};

const ecrisLExposition = (
  slide: ISlide,
  { ouverture, audience, dureeDysfonctionnement }: ExpositionDuService
) => {
  slide.modifyElement('exposition-ouverture', modify.setText(ouverture));
  if (nombreDeLignesDeTexte(ouverture, CARACTERES_PAR_LIGNE_DE_L_OUVERTURE) > 1)
    agrandisLOuvertureDUneLigne(slide);
  slide.modifyElement('exposition-audience', modify.setText(audience));
  slide.modifyElement(
    'exposition-duree',
    modify.setText(dureeDysfonctionnement)
  );
};

const PASTILLE_MODELE_DE_DONNEE = 'donnee-identifiee';
const PREMIERE_PASTILLE = { x: 12801600, y: 6411739 };
const BAS_DE_LA_ZONE_DES_PASTILLES = 6030739 + 3303761 - 228600;
const ECART_ENTRE_PASTILLES = 114300;
const LARGEUR_D_UNE_LIGNE_DE_PASTILLES = 4381500;
const MARGES_INTERIEURES_D_UNE_PASTILLE = 152400 + 25400;
const MARGES_VERTICALES_D_UNE_PASTILLE = 95250 + 95250;
const HAUTEUR_D_UNE_PASTILLE_D_UNE_LIGNE_EN_18_PT = 487635;
const HAUTEUR_D_UNE_PASTILLE_DE_DEUX_LIGNES_EN_18_PT = 784771;
const MARGE_DE_SECURITE_D_UNE_PASTILLE = 76200;
const TAILLES_DE_POLICE_DES_PASTILLES = [18, 16, 14];

const mesuresALaTaille = (taille: number) => {
  const proportion = taille / 18;
  const largeurMoyenneDUnCaractere = 118000 * proportion;
  return {
    taille,
    largeurPrudenteDUnCaractere: 128000 * proportion,
    hauteurDUnePastilleDUneLigne:
      MARGES_VERTICALES_D_UNE_PASTILLE +
      (HAUTEUR_D_UNE_PASTILLE_D_UNE_LIGNE_EN_18_PT -
        MARGES_VERTICALES_D_UNE_PASTILLE) *
        proportion,
    hauteurDUneLigneSupplementaire:
      (HAUTEUR_D_UNE_PASTILLE_DE_DEUX_LIGNES_EN_18_PT -
        HAUTEUR_D_UNE_PASTILLE_D_UNE_LIGNE_EN_18_PT) *
      proportion,
    caracteresParLigne: Math.floor(
      (LARGEUR_D_UNE_LIGNE_DE_PASTILLES - MARGES_INTERIEURES_D_UNE_PASTILLE) /
        largeurMoyenneDUnCaractere
    ),
  };
};
type MesuresDesPastilles = ReturnType<typeof mesuresALaTaille>;

const largeurDeLaPastille = (
  donnee: string,
  { largeurPrudenteDUnCaractere }: MesuresDesPastilles
) =>
  Math.min(
    LARGEUR_D_UNE_LIGNE_DE_PASTILLES,
    Math.round(
      donnee.length * largeurPrudenteDUnCaractere +
        MARGES_INTERIEURES_D_UNE_PASTILLE +
        MARGE_DE_SECURITE_D_UNE_PASTILLE
    )
  );

const hauteurDeLaPastille = (
  donnee: string,
  {
    hauteurDUnePastilleDUneLigne,
    hauteurDUneLigneSupplementaire,
    caracteresParLigne,
  }: MesuresDesPastilles
) =>
  Math.round(
    hauteurDUnePastilleDUneLigne +
      (nombreDeLignesDeTexte(donnee, caracteresParLigne) - 1) *
        hauteurDUneLigneSupplementaire
  );

type Pastille = { x: number; y: number; largeur: number; hauteur: number };

const tientSurLaLigne = (precedente: Pastille, largeur: number) =>
  precedente.x + precedente.largeur + ECART_ENTRE_PASTILLES + largeur <=
  PREMIERE_PASTILLE.x + LARGEUR_D_UNE_LIGNE_DE_PASTILLES;

const pastilleSuivante = (
  precedente: Pastille,
  { largeur, hauteur }: Pick<Pastille, 'largeur' | 'hauteur'>
): Pastille =>
  tientSurLaLigne(precedente, largeur)
    ? {
        x: precedente.x + precedente.largeur + ECART_ENTRE_PASTILLES,
        y: precedente.y,
        largeur,
        hauteur,
      }
    : {
        x: PREMIERE_PASTILLE.x,
        y: precedente.y + precedente.hauteur + ECART_ENTRE_PASTILLES,
        largeur,
        hauteur,
      };

const disposeLesPastilles = (
  donneesIdentifiees: string[],
  mesures: MesuresDesPastilles
) =>
  donneesIdentifiees.reduce<Pastille[]>((pastilles, donnee) => {
    const taille = {
      largeur: largeurDeLaPastille(donnee, mesures),
      hauteur: hauteurDeLaPastille(donnee, mesures),
    };
    const precedente = pastilles[pastilles.length - 1];
    return [
      ...pastilles,
      precedente
        ? pastilleSuivante(precedente, taille)
        : { ...PREMIERE_PASTILLE, ...taille },
    ];
  }, []);

const tiennentDansLaCarte = (pastilles: Pastille[]) =>
  pastilles.every(
    ({ y, hauteur }) => y + hauteur <= BAS_DE_LA_ZONE_DES_PASTILLES
  );

const etLesAutres = (nombre: number) =>
  nombre === 1 ? 'et 1 autre' : `et ${nombre} autres`;

const disposition = (textes: string[], taille: number) => ({
  taille,
  textes,
  pastilles: disposeLesPastilles(textes, mesuresALaTaille(taille)),
});

const disposeAvecLesAutresRegroupees = (donneesIdentifiees: string[]) => {
  const tailleMinimale =
    TAILLES_DE_POLICE_DES_PASTILLES[TAILLES_DE_POLICE_DES_PASTILLES.length - 1];
  const nombresDePastillesGardees = Array.from(
    { length: donneesIdentifiees.length },
    (_, index) => donneesIdentifiees.length - 1 - index
  );
  const dispositions = nombresDePastillesGardees.map((nombre) =>
    disposition(
      [
        ...donneesIdentifiees.slice(0, nombre),
        etLesAutres(donneesIdentifiees.length - nombre),
      ],
      tailleMinimale
    )
  );
  return (
    dispositions.find(({ pastilles }) => tiennentDansLaCarte(pastilles)) ??
    dispositions[dispositions.length - 1]
  );
};

const disposeLesPastillesDansLaCarte = (donneesIdentifiees: string[]) =>
  TAILLES_DE_POLICE_DES_PASTILLES.map((taille) =>
    disposition(donneesIdentifiees, taille)
  ).find(({ pastilles }) => tiennentDansLaCarte(pastilles)) ??
  disposeAvecLesAutresRegroupees(donneesIdentifiees);

const renommeLaForme = (nom: string) => (forme: XmlElement) => {
  forme.getElementsByTagName('p:cNvPr')[0].setAttribute('name', nom);
};

const donneDesIdentifiantsUniquesAuxFormes = (slide: XmlDocument) => {
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

const ecrisLesDonneesIdentifiees = (
  slide: ISlide,
  donneesIdentifiees: string[]
) => {
  slide.removeElement(PASTILLE_MODELE_DE_DONNEE);
  const { taille, textes, pastilles } =
    disposeLesPastillesDansLaCarte(donneesIdentifiees);
  textes.forEach((texte, index) => {
    const { x, y, largeur, hauteur } = pastilles[index];
    slide.addElement(
      MODELE,
      SLIDE_BESOINS_DE_SECURITE,
      PASTILLE_MODELE_DE_DONNEE,
      [
        modify.setText(texte),
        renommeLaForme(`${PASTILLE_MODELE_DE_DONNEE}-${index + 1}`),
        modify.setPosition({ x, y, w: largeur, h: hauteur }),
        changeLaTailleDePolice(taille),
      ]
    );
  });
  slide.modify(donneDesIdentifiantsUniquesAuxFormes);
};

const pointeLImageSur =
  (fichier: string) => (image: XmlElement, relation?: XmlElement) =>
    modify.setRelationTarget(fichier)(image, relation!);

const illustrationDuNiveau = (idNiveau: NiveauSecurite) => `${idNiveau}.png`;
const ILLUSTRATIONS_DES_NIVEAUX = (
  ['niveau1', 'niveau2', 'niveau3'] as NiveauSecurite[]
).map(illustrationDuNiveau);

const POLICES_D_UNE_CASE_DE_LA_MATRICE: Police[] = [
  { taille: 18, caracteresParLigne: 11, lignes: 3 },
  { taille: 16, caracteresParLigne: 12, lignes: 3 },
  { taille: 14, caracteresParLigne: 14, lignes: 4 },
  { taille: 12, caracteresParLigne: 16, lignes: 4 },
];
const GRAVITES_DE_LA_MATRICE = [1, 2, 3, 4];
const VRAISEMBLANCES_DE_LA_MATRICE = [1, 2, 3, 4];

const ecrisLaMatrice = (slide: ISlide, risques: RisqueCartographie[]) => {
  GRAVITES_DE_LA_MATRICE.forEach((gravite) =>
    VRAISEMBLANCES_DE_LA_MATRICE.forEach((vraisemblance) => {
      const identifiants = risques
        .filter(
          (risque) =>
            risque.gravite === gravite && risque.vraisemblance === vraisemblance
        )
        .map(({ identifiant }) => identifiant);
      const texte = identifiants.join(', ');
      slide.modifyElement(`matrice-g${gravite}-v${vraisemblance}`, [
        modify.setText(texte),
        changeLaTailleDePolice(
          policeQuiConvient(texte, POLICES_D_UNE_CASE_DE_LA_MATRICE).taille
        ),
      ]);
    })
  );
};

const NOMBRE_DE_LIGNES_DE_LA_LISTE_DES_RISQUES = 7;
const PARTIES_D_UNE_LIGNE_DE_RISQUE = [
  'fond',
  'pastille',
  'identifiant',
  'intitule',
];

const COULEURS_DES_NIVEAUX_DE_RISQUE: Record<NiveauDeRisque, string> = {
  faible: '84C14E',
  moyen: 'FAC63C',
  eleve: 'F8785B',
};

const colore = (couleur: string) => (forme: XmlElement) => {
  const [proprietes] = Array.from(forme.getElementsByTagName('p:spPr'));
  proprietes.getElementsByTagName('a:srgbClr')[0].setAttribute('val', couleur);
};

const CARACTERES_PAR_LIGNE_D_UN_INTITULE_DE_RISQUE = 48;
const HAUTEUR_D_UNE_LIGNE_DE_TEXTE_D_UN_RISQUE = 274320;
const MARGES_VERTICALES_DE_L_INTITULE_DE_RISQUE = 76200;
const MARGES_INTERIEURES_DE_L_INTITULE_DE_RISQUE = 50800;

const hauteurDeLaLigneDuRisque = ({ intitule }: RisqueCartographie) =>
  MARGES_VERTICALES_DE_L_INTITULE_DE_RISQUE +
  MARGES_INTERIEURES_DE_L_INTITULE_DE_RISQUE +
  nombreDeLignesDeTexte(
    intitule,
    CARACTERES_PAR_LIGNE_D_UN_INTITULE_DE_RISQUE
  ) *
    HAUTEUR_D_UNE_LIGNE_DE_TEXTE_D_UN_RISQUE;

const HAUTEUR_D_UNE_PASTILLE_DE_RISQUE = 300038;
const DECALAGE_DE_L_IDENTIFIANT_DANS_SA_PASTILLE = 19050;
const MARGE_HAUTE_DE_L_INTITULE_DE_RISQUE = 57150;
const HAUT_DE_LA_PREMIERE_LIGNE_DE_RISQUE = 3190949;
const ECART_ENTRE_LIGNES_DE_RISQUE = 38100;

const disposeLesLignesDeRisque = (risques: RisqueCartographie[]) =>
  risques.reduce<{ y: number; hauteur: number }[]>((lignes, risque) => {
    const precedente = lignes[lignes.length - 1];
    const y = precedente
      ? precedente.y + precedente.hauteur + ECART_ENTRE_LIGNES_DE_RISQUE
      : HAUT_DE_LA_PREMIERE_LIGNE_DE_RISQUE;
    return [...lignes, { y, hauteur: hauteurDeLaLigneDuRisque(risque) }];
  }, []);

const nombreDeRisques = (nombre: number) =>
  nombre > 1 ? `${nombre} RISQUES` : `${nombre} RISQUE`;

const ecrisLaListeDesRisques = (
  slide: ISlide,
  risques: RisqueCartographie[]
) => {
  slide.modifyElement(
    'liste-risques-total',
    modify.setText(nombreDeRisques(risques.length))
  );
  const lignes = disposeLesLignesDeRisque(risques);
  Array.from(
    { length: NOMBRE_DE_LIGNES_DE_LA_LISTE_DES_RISQUES },
    (_, index) => index + 1
  ).forEach((numeroLigne) => {
    const risque = risques[numeroLigne - 1];
    if (!risque) {
      PARTIES_D_UNE_LIGNE_DE_RISQUE.forEach((partie) =>
        slide.removeElement(`risque-${numeroLigne}-${partie}`)
      );
      return;
    }
    const { y, hauteur } = lignes[numeroLigne - 1];
    const yDeLaPastille =
      y + Math.floor((hauteur - HAUTEUR_D_UNE_PASTILLE_DE_RISQUE) / 2);
    slide.modifyElement(
      `risque-${numeroLigne}-fond`,
      modify.setPosition({ y, h: hauteur })
    );
    slide.modifyElement(
      `risque-${numeroLigne}-pastille`,
      modify.setPosition({ y: yDeLaPastille })
    );
    slide.modifyElement(
      `risque-${numeroLigne}-identifiant`,
      modify.setPosition({
        y: yDeLaPastille + DECALAGE_DE_L_IDENTIFIANT_DANS_SA_PASTILLE,
      })
    );
    slide.modifyElement(
      `risque-${numeroLigne}-intitule`,
      modify.setPosition({
        y: y + MARGE_HAUTE_DE_L_INTITULE_DE_RISQUE,
        h: hauteur - MARGES_VERTICALES_DE_L_INTITULE_DE_RISQUE,
      })
    );
    slide.modifyElement(
      `risque-${numeroLigne}-pastille`,
      colore(COULEURS_DES_NIVEAUX_DE_RISQUE[risque.niveau])
    );
    slide.modifyElement(
      `risque-${numeroLigne}-identifiant`,
      modify.setText(risque.identifiant)
    );
    slide.modifyElement(
      `risque-${numeroLigne}-intitule`,
      modify.setText(risque.intitule)
    );
  });
};

export class AdaptateurPowerpointAutomizer implements AdaptateurPowerpoint {
  constructor(private readonly dossierTemplates = 'src/vuesPowerpoint') {}

  async genereSupportCommissionHomologation({
    dateCreation,
    autorite,
    piecesDuDossier,
    contexte,
    besoinsDeSecurite,
    cartographiesDesRisques,
  }: DonneesSupportCommissionHomologation) {
    const presentation = new Automizer({
      templateDir: this.dossierTemplates,
      removeExistingSlides: true,
      autoImportSlideMasters: false,
      cleanup: true,
    })
      .loadRoot(NOM_TEMPLATE)
      .load(NOM_TEMPLATE, MODELE)
      .loadMedia(
        ILLUSTRATIONS_DES_NIVEAUX,
        `${this.dossierTemplates}/illustrationsNiveaux`
      );

    presentation.addSlide(MODELE, SLIDE_COUVERTURE, (slide) => {
      slide.modifyElement(
        'date-creation',
        modify.replaceText({
          replace: 'dateCreation',
          by: { text: dateEnFrancais(dateCreation) },
        })
      );
    });
    presentation.addSlide(MODELE, SLIDE_SOMMAIRE);
    presentation.addSlide(MODELE, SLIDE_MEMBRES_COMMISSION, (slide) => {
      ecrisAutoriteHomologation(slide, autorite);
    });
    const pages = decoupeEnPages(piecesDuDossier);
    const avecPageVide = laDernierePageEstPleine(piecesDuDossier);
    const nombrePages = pages.length + (avecPageVide ? 1 : 0);
    pages.forEach((piecesDeLaPage, index) => {
      presentation.addSlide(MODELE, SLIDE_PAGE_PIECES, (slide) => {
        ecrisNumeroDePage(slide, index + 1, nombrePages);
        ecrisPiecesDuDossier(slide, piecesDeLaPage);
      });
    });
    if (avecPageVide) {
      presentation.addSlide(MODELE, SLIDE_PAGE_PIECES_VIDE, (slide) => {
        ecrisNumeroDePage(slide, nombrePages, nombrePages);
      });
    }
    presentation.addSlide(MODELE, SLIDE_PRESENTATION_DU_SYSTEME);
    presentation.addSlide(MODELE, SLIDE_CONTEXTE, (slide) => {
      ecrisLaDescription(slide, contexte.description);
      slide.modifyElement(
        'contexte-organisation',
        modify.setText(contexte.organisation)
      );
      slide.modifyElement('contexte-statut', modify.setText(contexte.statut));
      slide.modifyElement('contexte-urls', modify.setText(contexte.urls));
      slide.modifyElement(
        'contexte-type-de-projet',
        modify.setText(contexte.typeDeProjet)
      );
      slide.modifyElement(
        'contexte-hebergement',
        modify.setText(contexte.hebergement)
      );
      slide.modifyElement(
        'contexte-donnees-stockees',
        modify.setText(contexte.donneesStockees)
      );
      slide.modifyElement(
        'contexte-securisations',
        modify.setText(contexte.securisations)
      );
    });
    presentation.addSlide(MODELE, SLIDE_PERIMETRE_VUE_FONCTIONNELLE);
    presentation.addSlide(MODELE, SLIDE_PERIMETRE_DESCRIPTION_TECHNIQUE);
    presentation.addSlide(MODELE, SLIDE_BESOINS_DE_SECURITE, (slide) => {
      slide.modifyElement(
        'besoins-niveau',
        modify.setText(besoinsDeSecurite.niveau)
      );
      slide.modifyElement(
        'besoins-resume',
        modify.setText(besoinsDeSecurite.resume)
      );
      slide.modifyElement(
        'besoins-demarche',
        modify.replaceText({
          replace: 'demarche',
          by: { text: besoinsDeSecurite.demarche.toLocaleUpperCase('fr') },
        })
      );
      slide.modifyElement(
        'besoins-illustration',
        pointeLImageSur(illustrationDuNiveau(besoinsDeSecurite.idNiveau))
      );
      ecrisEncartAnssi(slide, besoinsDeSecurite);
      ecrisLExposition(slide, besoinsDeSecurite.exposition);
      ecrisLesDonneesIdentifiees(slide, besoinsDeSecurite.donneesIdentifiees);
      slide.modifyElement(
        'besoins-explication',
        modify.replaceText([
          { replace: 'nomService', by: { text: besoinsDeSecurite.nomService } },
          { replace: 'niveau', by: { text: besoinsDeSecurite.niveau } },
        ])
      );
    });
    presentation.addSlide(MODELE, SLIDE_INTERCALAIRE_HISTORIQUE);
    presentation.addSlide(MODELE, SLIDE_HISTORIQUE);
    presentation.addSlide(MODELE, SLIDE_INTERCALAIRE_RISQUES);
    presentation.addSlide(MODELE, SLIDE_CARTOGRAPHIE_DES_RISQUES, (slide) => {
      ecrisLaMatrice(slide, cartographiesDesRisques.bruts);
      ecrisLaListeDesRisques(slide, cartographiesDesRisques.bruts);
    });

    const archive = await presentation.getJSZip();
    await retireLesPartiesDesSlidesRetirees(archive);
    await retireLesRelationsDImagesInutilisees(archive);
    await retireLesDeclarationsDesPartiesAbsentes(archive);
    return archive.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
  }
}

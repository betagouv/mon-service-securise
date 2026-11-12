import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_BESOINS_DE_SECURITE } from '../template.js';
import { NiveauSecurite } from '../../../../donneesReferentielMesuresV2.js';
import {
  BesoinsDeSecurite,
  ExpositionDuService,
} from '../../../modeles/objetsPowerpoint/besoinsDeSecurite.js';
import { changeLaTailleDePolice, nombreDeLignesDeTexte } from '../texte.js';
import {
  donneDesIdentifiantsUniquesAuxFormes,
  pointeLImageSur,
  renommeLaForme,
} from '../formes.js';

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

const illustrationDuNiveau = (idNiveau: NiveauSecurite) => `${idNiveau}.png`;
export const ILLUSTRATIONS_DES_NIVEAUX = (
  ['niveau1', 'niveau2', 'niveau3'] as NiveauSecurite[]
).map(illustrationDuNiveau);

export const ajouteLesBesoinsDeSecurite = (
  presentation: Automizer,
  besoinsDeSecurite: BesoinsDeSecurite
) => {
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
};

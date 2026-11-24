import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import {
  cadreDeLaForme,
  contenusDesSlides,
  couleurDuFond,
  couleursDuTexte,
  formeNommee,
  nomsDesFormes,
  nomsDesFormesCommencantPar,
  taillesDePolice,
  texteDeLaForme,
} from '../aides/lecturePptx.js';
import {
  DESCRIPTION_DU_CONTEXTE,
  nomDeLaLigneDePiece,
  nomsDesPastilles,
  pagesDeLaCartographie,
  pagesDesAvis,
  pagesDesPieces,
  slideAvecLaForme,
  slideDesBesoins,
  slideDuContexte,
  slidesDeLAnnexe,
  texteDeLaLigneDePiece,
} from '../aides/lectureSupportCommission.js';
import {
  repete,
  unAvis,
  uneExigence,
  uneMesure,
  unePiece,
  unRisque,
  unSupportDeCommission,
} from '../constructeurs/constructeurSupportCommissionHomologation.js';

const unePieceAbregeable = (intitule: string) =>
  unePiece(intitule, {
    intituleAbrege: 'Avis écrits des collaborateurs',
    source: 'Utilisateur',
  });

const descriptionSurQuatreLignesDansPowerPoint = repete(
  "Héberger le système d'information et les données auprès d'un prestataire d'informatique en nuage qualifié SecNumCloud",
  2,
  ''
);

const commentaireDe1000Caracteres = repete(
  'Les sauvegardes doivent être testées avant la mise en production.',
  16
).slice(0, 1000);

const donnees = unSupportDeCommission()
  .avecPieces(
    unePieceAbregeable(
      'Avis écrits de Jean Dupond, Marie Martin, Paul Durand, Sophie Bernard, Lucas Petit, Emma Moreau, Hugo Laurent, Léa Fournier, Nathan Girard et Chloé Garnier'
    ),
    unePiece('Pièce 2'),
    unePieceAbregeable(
      'Avis écrits de Jean Dupond, Marie Martin et Paul Durand'
    ),
    unePiece('Pièce 4')
  )
  .avecContexte({ description: repete('description', 60) })
  .avecDonneesIdentifiees(
    "Données d'identité",
    'Documents RH sensibles',
    'Données relatives à la situation familiale, économique et financière',
    'Données techniques',
    'Plannings des agents',
    'Agendas des élus',
    'Comptes rendus de réunion'
  )
  .avecRisquesBruts(
    unRisque('R1', { gravite: 1, vraisemblance: 1, niveau: 'faible' }),
    unRisque('R2', { gravite: 4, vraisemblance: 1, niveau: 'moyen' }),
    unRisque('R3', { gravite: 4, vraisemblance: 4, niveau: 'eleve' }),
    unRisque('RS1', { gravite: 4, vraisemblance: 4, niveau: 'nonEvalue' })
  )
  .avecRisquesADate(
    unRisque('R1', {
      gravite: 2,
      vraisemblance: 2,
      niveau: 'faible',
      intitule: repete('intitulé', 20),
      description: 'Courte',
    }),
    unRisque('R2', {
      gravite: 2,
      vraisemblance: 2,
      niveau: 'faible',
      intitule: 'Court',
      description: repete('description', 40),
    })
  )
  .avecExigencesRestantes(
    uneExigence('Une mesure générale', {
      cartouches: ['Indispensable', 'ANSSI', 'Gouvernance', '#0022'],
    }),
    uneExigence(`M 19 ${descriptionSurQuatreLignesDansPowerPoint}`, {
      cartouches: ['Mesures ajoutées', 'Protection'],
    })
  )
  .avecAvis(
    unAvis('Jean Dupond'),
    unAvis('Paul Martin', { commentaire: commentaireDe1000Caracteres }),
    unAvis('Sophie Bernard')
  )
  .avecAnnexe(
    { statut: 'fait', mesures: [uneMesure('Une mesure')] },
    { statut: 'enCours', mesures: [uneMesure('Seule mesure')] },
    {
      statut: 'aLancer',
      mesures: [uneMesure('Une mesure'), uneMesure('Une autre')],
    },
    { statut: 'sansStatut', mesures: [uneMesure('Une mesure')] }
  )
  .construis();

describe("Le support de commission d'homologation du groupe 4", () => {
  let slides: string[];

  beforeAll(async () => {
    const pptx =
      await new AdaptateurPowerpointAutomizer().genereSupportCommissionHomologation(
        donnees
      );
    slides = await contenusDesSlides(pptx);
  });

  describe("sur la page des pièces du dossier, pour des pièces dont l'intitulé peut être abrégé", () => {
    const PAS_D_UNE_LIGNE_DE_TEXTE = 257175;
    const ordonnee = (page: string, numero: number, partie: string) =>
      cadreDeLaForme(page, nomDeLaLigneDePiece(numero, partie)).y;

    it('[11] agrandit sa ligne et descend les lignes suivantes de la colonne quand son intitulé tient sur deux lignes', () => {
      const [page] = pagesDesPieces(slides);

      expect(
        ordonnee(page, 3, 'separateur') - ordonnee(page, 11, 'separateur')
      ).toBe(PAS_D_UNE_LIGNE_DE_TEXTE);
      expect(ordonnee(page, 4, 'case') - ordonnee(page, 12, 'case')).toBe(
        PAS_D_UNE_LIGNE_DE_TEXTE
      );
    });

    it("[12] écrit son intitulé abrégé, sur une seule ligne, quand l'intitulé complet dépasserait trois lignes", () => {
      const [page] = pagesDesPieces(slides);

      expect(texteDeLaLigneDePiece(page, 1, 'intitule')).toBe(
        'Avis écrits des collaborateurs'
      );
      expect(ordonnee(page, 2, 'case')).toBe(ordonnee(page, 10, 'case'));
    });
  });

  describe('sur le contexte', () => {
    it('[18] coupe la description par « … » quand elle dépasse quatre lignes à 14 pt', () => {
      const contexte = slideDuContexte(slides);

      expect(texteDeLaForme(contexte, DESCRIPTION_DU_CONTEXTE)).toBe(
        `${repete('description', 40)}…`
      );
      expect([
        ...new Set(taillesDePolice(contexte, DESCRIPTION_DU_CONTEXTE)),
      ]).toEqual(['1400']);
    });
  });

  describe('sur les pastilles des données identifiées', () => {
    const BAS_DE_LA_ZONE_DES_PASTILLES = 6030739 + 3303761 - 228600;

    it('[38] remplacent les dernières par « et N autres » quand elles débordent même en 14 pt', () => {
      const besoins = slideDesBesoins(slides);
      const noms = nomsDesPastilles(besoins);
      const pastilles = noms.map((nom) => cadreDeLaForme(besoins, nom));

      expect(texteDeLaForme(besoins, noms[noms.length - 1])).toBe(
        `et ${7 - (noms.length - 1)} autres`
      );
      expect(noms.length).toBeLessThan(7);
      expect(
        Math.max(...pastilles.map(({ y, hauteur }) => y + hauteur))
      ).toBeLessThanOrEqual(BAS_DE_LA_ZONE_DES_PASTILLES);
    });
  });

  describe('sur la cartographie des risques bruts', () => {
    const cartographie = () =>
      pagesDeLaCartographie(slides, 'Cartographie des risques bruts')[0];

    it('[52] colore la pastille de chaque risque selon son niveau, comme les cases de la matrice', () => {
      expect(
        [1, 2, 3].map((numero) =>
          couleurDuFond(cartographie(), `risque-${numero}-pastille`)
        )
      ).toEqual(['84C14E', 'FAC63C', 'F8785B']);
    });

    it("[53] colore en gris la pastille d'un risque non évalué", () => {
      expect(couleurDuFond(cartographie(), 'risque-4-pastille')).toBe('EEEEEE');
    });
  });

  describe('sur les exigences restantes', () => {
    const HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION = 297180;

    const slideDesExigences = () =>
      slideAvecLaForme(slides, 'exigences-restantes-titre');

    describe('pour les cartouches', () => {
      it('[87] écrit chaque cartouche et retire celles qui ne servent pas', () => {
        const slide = slideDesExigences();

        const textesDesCartouches = (numero: number) =>
          nomsDesFormes(slide)
            .filter((nom) =>
              new RegExp(`^exigence-${numero}-cartouche-\\d-texte$`).test(nom)
            )
            .map((nom) => texteDeLaForme(slide, nom));
        expect(textesDesCartouches(1)).toEqual([
          'Indispensable',
          'ANSSI',
          'Gouvernance',
          '#0022',
        ]);
        expect(textesDesCartouches(2)).toEqual([
          'Mesures ajoutées',
          'Protection',
        ]);
        expect(
          nomsDesFormes(slide).filter((nom) =>
            /^exigence-2-cartouche-[34]-/.test(nom)
          )
        ).toEqual([]);
      });

      it('[88] écrit les cartouches en italique, comme tout ce qui est prérempli, sans rétrécir leur texte', () => {
        const slide = slideDesExigences();

        [1, 2, 3, 4].forEach((numero) => {
          const texte = formeNommee(
            slide,
            `exigence-1-cartouche-${numero}-texte`
          );
          expect(
            Array.from(texte.getElementsByTagName('a:rPr')).map((proprietes) =>
              proprietes.getAttribute('i')
            )
          ).toEqual(['1']);
          expect(texte.getElementsByTagName('a:normAutofit')).toHaveLength(0);
        });
      });

      it('[89] ajuste la largeur de chaque cartouche à son texte et les fait se suivre', () => {
        const slide = slideDesExigences();

        const fonds = [1, 2, 3, 4].map((numero) =>
          cadreDeLaForme(slide, `exigence-1-cartouche-${numero}-fond`)
        );
        const largeursDeLaMaquette = [1677516, 952723, 1639193, 902419];
        fonds.forEach(({ largeur }, index) =>
          expect(Math.abs(largeur - largeursDeLaMaquette[index])).toBeLessThan(
            1000
          )
        );
        [1, 2, 3].forEach((index) =>
          expect(
            fonds[index].x - (fonds[index - 1].x + fonds[index - 1].largeur)
          ).toBe(76200)
        );
        [1, 2, 3, 4].forEach((numero) => {
          const fond = fonds[numero - 1];
          const texte = cadreDeLaForme(
            slide,
            `exigence-1-cartouche-${numero}-texte`
          );
          expect(texte.x).toBe(fond.x + 133350);
        });
      });
    });

    it('[91] compte les lignes de la description à la largeur de son texte, pas à son nombre de caractères', () => {
      const slide = slideDesExigences();

      expect(
        cadreDeLaForme(slide, 'exigence-2-description').hauteur -
          cadreDeLaForme(slide, 'exigence-1-description').hauteur
      ).toBe(3 * HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION);
    });
  });

  describe('sur les avis des membres, quand un commentaire ne tient pas en 14 pt dans une carte de la largeur du modèle', () => {
    it("[106] agrandit seulement sa carte, à la largeur de deux cartes et de l'écart qui les sépare", () => {
      const [slide] = pagesDesAvis(slides);

      expect(
        [1, 2, 3].map((numero) => {
          const { x, largeur } = cadreDeLaForme(slide, `avis-${numero}-carte`);
          return [x, largeur];
        })
      ).toEqual([
        [838200, 3952875],
        [5057775, 8172450],
        [13496925, 3952875],
      ]);
      const agrandie = cadreDeLaForme(slide, 'avis-2-carte');
      expect(
        ['bandeau', 'membres', 'commentaire'].map((partie) => {
          const { x, largeur } = cadreDeLaForme(slide, `avis-2-${partie}`);
          return [
            x - agrandie.x,
            agrandie.x + agrandie.largeur - (x + largeur),
          ];
        })
      ).toEqual([
        [0, 0],
        [266700, 266700],
        [266700, 266700],
      ]);
      expect(
        nomsDesFormes(slide).filter((nom) => /^avis-4-/.test(nom))
      ).toEqual([]);
    });
  });

  describe("sur l'annexe des mesures", () => {
    const slideDuStatut = (libelle: string) => {
      const slide = slidesDeLAnnexe(slides).find(
        (candidate) =>
          texteDeLaForme(candidate, 'annexe-statut-texte') === libelle
      );
      if (!slide) throw new Error(`Aucune slide d'annexe pour ${libelle}`);
      return slide;
    };

    it('[114] retire les lignes sans mesure', () => {
      const slide = slideDuStatut('PARTIELLE');

      expect(
        nomsDesFormes(slide).filter((nom) => /^mesure-[2-9]-/.test(nom))
      ).toEqual([]);
      expect(nomsDesFormesCommencantPar(slide, 'mesure-1-')).toHaveLength(8);
    });

    it('[118] colore la pastille de chaque statut comme la légende des statistiques, bordure grise comprise pour « Statut à définir »', () => {
      const bordure = (slide: string) =>
        formeNommee(slide, 'annexe-statut-fond')
          .getElementsByTagName('a:ln')[0]
          ?.getElementsByTagName('a:srgbClr')[0]
          ?.getAttribute('val');

      expect(
        slidesDeLAnnexe(slides).map((slide) => [
          texteDeLaForme(slide, 'annexe-statut-texte'),
          couleursDuTexte(slide, 'annexe-statut-texte'),
          couleurDuFond(slide, 'annexe-statut-fond'),
          bordure(slide),
        ])
      ).toEqual([
        ['FAITE', ['0C8626'], 'D4F4DB', undefined],
        ['PARTIELLE', ['0079D0'], 'DBEEFF', undefined],
        ['À LANCER', ['7025DA'], 'E9DDFF', undefined],
        ['STATUT À DÉFINIR', ['667892'], 'F1F5F9', '94A3B8'],
      ]);
    });

    it('[119] écrit le nombre de mesures du statut, au singulier ou au pluriel', () => {
      expect(
        slidesDeLAnnexe(slides).map((slide) =>
          texteDeLaForme(slide, 'annexe-nombre')
        )
      ).toEqual(['1 mesure', '1 mesure', '2 mesures', '1 mesure']);
    });
  });

  describe('sur la description des risques', () => {
    const HAUTEUR_D_UNE_LIGNE_DE_TEXTE_EN_18_PT = 274320;
    const MARGES_D_UNE_LIGNE = 76200 + 50800;

    it('[124] prennent la hauteur de la plus haute des deux colonnes de texte, en 18 pt', () => {
      const description = slideAvecLaForme(slides, 'description-risques-total');

      const hauteur = (numero: number) =>
        cadreDeLaForme(
          description,
          `description-risque-${numero}-fond-intitule`
        ).hauteur;
      const lignesIntitule1 = 4;
      const lignesDescription2 = 6;
      expect(hauteur(1)).toBe(
        MARGES_D_UNE_LIGNE +
          lignesIntitule1 * HAUTEUR_D_UNE_LIGNE_DE_TEXTE_EN_18_PT
      );
      expect(hauteur(2)).toBe(
        MARGES_D_UNE_LIGNE +
          lignesDescription2 * HAUTEUR_D_UNE_LIGNE_DE_TEXTE_EN_18_PT
      );
    });
  });
});

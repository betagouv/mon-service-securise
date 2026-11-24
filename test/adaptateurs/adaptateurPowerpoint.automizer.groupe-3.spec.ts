import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import {
  contenusDesSlides,
  couleurDuFond,
  nomsDesFormesCommencantPar,
  taillesDePolice,
  texteDeLaForme,
  texteDeLaSlide,
} from '../aides/lecturePptx.js';
import {
  DESCRIPTION_DU_CONTEXTE,
  descriptionsDesExigences,
  descriptionsDesMesures,
  identifiantsDesRisques,
  nomsDesPastilles,
  pagesDeLaCartographie,
  pagesDesAvis,
  pagesDesExigences,
  pagesDesPieces,
  pastillesDesDonnees,
  slideAvecLaForme,
  slideDesBesoins,
  slideDesStatistiques,
  slideDuContexte,
  slidesDeLAnnexe,
  titreDeLaPageDesPieces,
} from '../aides/lectureSupportCommission.js';
import {
  repete,
  unAvis,
  uneCriticite,
  uneExigence,
  uneMesure,
  unePiece,
  unRisque,
  unSupportDeCommission,
} from '../constructeurs/constructeurSupportCommissionHomologation.js';

const intituleDeTroisLignes = repete(
  "Compromission d'un poste de travail utilisateur",
  3
);

const descriptionSurQuatreLignes =
  "Héberger le système d'information et les données auprès d'un prestataire d'informatique en nuage qualifié SecNumCloud, puis vérifier régulièrement que le prestataire respecte ses engagements contractuels, notamment en matière de localisation des données et de réversibilité";

const unCommentaireSur = (lignes: number) => repete('Une ligne', lignes, '\n');

const donnees = unSupportDeCommission()
  .avecPieces(
    ...Array.from({ length: 16 }, (_, index) => unePiece(`Pièce ${index + 1}`))
  )
  .avecContexte({ description: repete('description', 35) })
  .avecDonneesIdentifiees(
    'Données techniques',
    'Documents RH sensibles',
    "Données d'identité",
    'Plannings des agents',
    'Données sensibles'
  )
  .avecRisquesBruts(
    ...Array.from({ length: 8 }, (_, index) =>
      unRisque(`R${index + 1}`, { intitule: intituleDeTroisLignes })
    )
  )
  .avecRisquesADate(
    unRisque('R1', { gravite: 2, vraisemblance: 2, niveau: 'faible' }),
    unRisque('R2', { gravite: 2, vraisemblance: 2, niveau: 'moyen' }),
    unRisque('R3', { gravite: 2, vraisemblance: 2, niveau: 'eleve' }),
    unRisque('RS1', { gravite: 2, vraisemblance: 2, niveau: 'nonEvalue' })
  )
  .avecCriticites({
    indispensables: uneCriticite({ fait: 3, restant: 0 }),
    recommandees: uneCriticite({ aRemplir: 4, restant: 4 }),
  })
  .avecExigencesRestantes(
    ...[1, 2, 3, 4, 5, 6].map((numero) => uneExigence(`Exigence ${numero}`))
  )
  .avecAvis(
    ...[11, 12, 13, 14].map((lignes) =>
      unAvis('Jean Dupond', { commentaire: unCommentaireSur(lignes) })
    ),
    unAvis('Paul Martin')
  )
  .avecAnnexe({
    statut: 'fait',
    mesures: Array.from({ length: 5 }, () =>
      uneMesure(descriptionSurQuatreLignes)
    ),
  })
  .construis();

describe("Le support de commission d'homologation du groupe 3", () => {
  let slides: string[];

  beforeAll(async () => {
    const pptx =
      await new AdaptateurPowerpointAutomizer().genereSupportCommissionHomologation(
        donnees
      );
    slides = await contenusDesSlides(pptx);
  });

  describe('sur la page des pièces du dossier', () => {
    it('[10] ajoute une page entièrement à compléter quand les pièces remplissent exactement leurs pages', () => {
      const pages = pagesDesPieces(slides);

      expect(pages.map(titreDeLaPageDesPieces)).toEqual([
        'Pièces du dossier transmises avant la séance 1/2',
        'Pièces du dossier transmises avant la séance 2/2',
      ]);
      expect(texteDeLaSlide(pages[1])).not.toContain(
        'Prérempli par MonServiceSécurisé'
      );
    });
  });

  describe('sur le contexte', () => {
    it('[16] réduit la police de la description à 14 pt quand elle dépasse trois lignes à 16 pt', () => {
      expect([
        ...new Set(
          taillesDePolice(slideDuContexte(slides), DESCRIPTION_DU_CONTEXTE)
        ),
      ]).toEqual(['1400']);
    });
  });

  describe('sur les pastilles des données identifiées', () => {
    const BAS_DE_LA_ZONE_DES_PASTILLES = 6030739 + 3303761 - 228600;

    it('[37] réduisent leur police pour tenir dans la carte quand elles débordent en 18 pt', () => {
      const besoins = slideDesBesoins(slides);
      const pastilles = pastillesDesDonnees(besoins);
      const tailles = [
        ...new Set(
          nomsDesPastilles(besoins).flatMap((nom) =>
            taillesDePolice(besoins, nom)
          )
        ),
      ];

      expect(tailles).toHaveLength(1);
      expect(Number(tailles[0])).toBeLessThan(1800);
      expect(
        Math.max(...pastilles.map(({ y, hauteur }) => y + hauteur))
      ).toBeLessThanOrEqual(BAS_DE_LA_ZONE_DES_PASTILLES);
    });
  });

  describe('sur la cartographie des risques bruts', () => {
    it('[57] répartit les risques sur plusieurs pages, selon la hauteur de leurs lignes', () => {
      const pages = pagesDeLaCartographie(
        slides,
        'Cartographie des risques bruts'
      );

      expect(pages.map(identifiantsDesRisques)).toEqual([
        ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'],
        ['R7', 'R8'],
      ]);
    });
  });

  describe('sur les statistiques des mesures', () => {
    it('[83] retire les segments des statuts sans mesure', () => {
      expect(
        nomsDesFormesCommencantPar(slideDesStatistiques(slides), 'criticite-')
      ).toEqual([
        'criticite-indispensables-restant',
        'criticite-indispensables-barre',
        'criticite-indispensables-fait',
        'criticite-recommandees-restant',
        'criticite-recommandees-barre',
      ]);
    });
  });

  describe('sur les exigences restantes', () => {
    it('[95] ne met pas plus de 5 exigences par page, le nombre de lignes du modèle', () => {
      expect(pagesDesExigences(slides).map(descriptionsDesExigences)).toEqual([
        ['Exigence 1', 'Exigence 2', 'Exigence 3', 'Exigence 4', 'Exigence 5'],
        ['Exigence 6'],
      ]);
    });

    it('[96] numérote les pages dans le titre', () => {
      expect(
        pagesDesExigences(slides).map((page) =>
          texteDeLaForme(page, 'exigences-restantes-titre')
        )
      ).toEqual([
        'Exigences à mettre en place restantes 1/2',
        'Exigences à mettre en place restantes 2/2',
      ]);
    });
  });

  describe('sur les avis des membres', () => {
    it('[105] réduit la police du commentaire à la plus grande taille qui tient dans la carte : 18, 16 puis 14 pt', () => {
      const [premierePage] = pagesDesAvis(slides);

      expect(
        [1, 2, 3, 4].map((numero) => [
          ...new Set(
            taillesDePolice(premierePage, `avis-${numero}-commentaire`)
          ),
        ])
      ).toEqual([['1800'], ['1600'], ['1600'], ['1400']]);
    });

    it('[108] numérote les pages dans le titre', () => {
      expect(
        pagesDesAvis(slides).map((page) => texteDeLaForme(page, 'avis-titre'))
      ).toEqual([
        'Avis formalisés des membres 1/2',
        'Avis formalisés des membres 2/2',
      ]);
    });
  });

  describe("sur l'annexe des mesures", () => {
    it('[117] répartit les mesures selon la hauteur de leurs lignes', () => {
      expect(
        slidesDeLAnnexe(slides).map(
          (page) => descriptionsDesMesures(page).length
        )
      ).toEqual([3, 2]);
    });
  });

  describe('sur la description des risques', () => {
    it('[121] colore la pastille de chaque risque selon son niveau à date', () => {
      const description = slideAvecLaForme(slides, 'description-risques-total');

      expect(
        [1, 2, 3, 4].map((numero) =>
          couleurDuFond(description, `description-risque-${numero}-pastille`)
        )
      ).toEqual(['84C14E', 'FAC63C', 'F8785B', 'EEEEEE']);
    });
  });
});

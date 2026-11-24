import { readFile } from 'node:fs/promises';
import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import { SLIDE_BESOINS_DE_SECURITE } from '../../src/adaptateurs/automizer/template.js';
import {
  cadreDeLaForme,
  contenusDesSlides,
  imageDeLaForme,
  nomsDesFormes,
  nomsDesFormesCommencantPar,
  taillesDePolice,
  texteDeLaForme,
  textesDeLaSlide,
} from '../aides/lecturePptx.js';
import {
  DESCRIPTION_DU_CONTEXTE,
  descriptionsDesExigences,
  identifiantsDeLaDescriptionDesRisques,
  identifiantsDesRisques,
  membresDesAvis,
  nomDeLaLigneDePiece,
  pagesDeLaCartographie,
  pagesDeLaDescriptionDesRisques,
  pagesDesAvis,
  pagesDesExigences,
  pagesDesPieces,
  pastillesDesDonnees,
  positionDeLaSlideAvecLaForme,
  slideAvecLaForme,
  slideDesBesoins,
  slideDesStatistiques,
  slideDuContexte,
  slideDuModele,
  slidesDeLAnnexe,
  descriptionsDesMesures,
  texteDeLaLigneDePiece,
  titreDeLaPageDesPieces,
} from '../aides/lectureSupportCommission.js';
import {
  repete,
  unAvis,
  uneCategorie,
  uneCriticite,
  uneExigence,
  uneMesure,
  unePiece,
  unRisque,
  unSupportDeCommission,
} from '../constructeurs/constructeurSupportCommissionHomologation.js';

const commentaireLong = repete(
  'Les sauvegardes doivent être testées avant la mise en production.',
  10
);

const descriptionDeTroisLignes = repete(
  'Pour atteindre son objectif visé, un attaquant externe va compromettre',
  3
);

const IDENTIFIANTS_DES_RISQUES_BRUTS = [
  'R3',
  'R5',
  'R6',
  'R7',
  'R8',
  'R11',
  'R14',
  'RS4',
  'RS5',
];

const donnees = unSupportDeCommission()
  .avecAutorite({ nom: 'Jean Dupond', fonction: 'RSSI' })
  .avecPieces(
    unePiece('Présent support de commission', {
      source: 'MonServiceSécurisé',
      cochee: true,
    }),
    unePiece('Charte informatique', { source: 'Utilisateur', cochee: false }),
    ...Array.from({ length: 18 }, (_, index) => unePiece(`Pièce ${index + 3}`))
  )
  .avecContexte({ description: repete('description', 20) })
  .avecBesoinsDeSecurite({
    idNiveau: 'niveau2',
    depasseRecommandation: false,
  })
  .avecExposition({
    ouverture:
      "Accessible à très peu de personnes en interne de l'organisation",
  })
  .avecDonneesIdentifiees(
    'Données relatives à la situation familiale, économique et financière',
    'Données techniques'
  )
  .avecRisquesBruts(
    ...IDENTIFIANTS_DES_RISQUES_BRUTS.map((identifiant) =>
      unRisque(identifiant)
    )
  )
  .avecRisquesADate(
    ...Array.from({ length: 8 }, (_, index) =>
      unRisque(`R${index + 1}`, {
        gravite: 2,
        vraisemblance: 2,
        niveau: 'faible',
        description: descriptionDeTroisLignes,
      })
    )
  )
  .avecStatistiquesDesMesures({
    nombreDeMesuresGenerales: 1,
    nombreDeMesuresSpecifiques: 1,
    referentiels: "l'ANSSI",
  })
  .avecCategories(
    uneCategorie('Gouvernance', { fait: 19, aLancer: 2, aRemplir: 5 }),
    uneCategorie('Protection', {
      fait: 15,
      enCours: 2,
      nonFait: 3,
      aRemplir: 51,
    }),
    uneCategorie('Défense', { aRemplir: 10 })
  )
  .avecCriticites({
    indispensables: uneCriticite({
      fait: 2,
      enCours: 25,
      nonFait: 3,
      aLancer: 6,
      aRemplir: 14,
      restant: 48,
    }),
    recommandees: uneCriticite(),
  })
  .avecExigencesRestantes(
    ...[1, 2, 3, 4, 5, 6].map((numero) =>
      uneExigence(
        `Exigence ${numero} : documenter et autoriser uniquement les communications nécessaires via des règles de filtrage`
      )
    )
  )
  .avecAvis(
    unAvis('A'),
    unAvis('B'),
    unAvis('C'),
    unAvis('D', { commentaire: commentaireLong }),
    unAvis('E'),
    unAvis('F'),
    unAvis('G', { commentaire: commentaireLong })
  )
  .avecAnnexe({
    statut: 'fait',
    mesures: Array.from({ length: 12 }, (_, index) =>
      uneMesure(`Mesure ${index + 1}`)
    ),
  })
  .construis();

describe("Le support de commission d'homologation du groupe 2", () => {
  let pptx: Buffer;
  let slides: string[];

  beforeAll(async () => {
    pptx =
      await new AdaptateurPowerpointAutomizer().genereSupportCommissionHomologation(
        donnees
      );
    slides = await contenusDesSlides(pptx);
  });

  describe("sur l'autorité d'homologation", () => {
    it("[2] écrit le nom et la fonction de l'autorité d'homologation dans la composition de la commission", () => {
      const commission = slideAvecLaForme(slides, 'autorite-homologation');

      expect(textesDeLaSlide(commission)).toContain('Jean Dupond, RSSI');
    });

    it("[3] ne laisse pas l'autorité d'homologation à compléter quand elle est renseignée", () => {
      const commission = slideAvecLaForme(slides, 'autorite-homologation');

      expect(
        nomsDesFormesCommencantPar(
          commission,
          'autorite-homologation-a-completer'
        )
      ).toEqual([]);
    });
  });

  describe('sur la page des pièces du dossier', () => {
    it("[5] écrit l'intitulé, la source et la case de chaque pièce", () => {
      const [page] = pagesDesPieces(slides);

      expect(texteDeLaLigneDePiece(page, 1, 'case')).toBe('☑');
      expect(texteDeLaLigneDePiece(page, 1, 'intitule')).toBe(
        'Présent support de commission'
      );
      expect(texteDeLaLigneDePiece(page, 1, 'source')).toBe(
        'MonServiceSécurisé'
      );
      expect(texteDeLaLigneDePiece(page, 2, 'case')).toBe('☐');
      expect(texteDeLaLigneDePiece(page, 2, 'intitule')).toBe(
        'Charte informatique'
      );
      expect(texteDeLaLigneDePiece(page, 2, 'source')).toBe('Utilisateur');
    });

    it('[8] répartit les pièces sur plusieurs pages numérotées au-delà de 16', () => {
      expect(pagesDesPieces(slides).map(titreDeLaPageDesPieces)).toEqual([
        'Pièces du dossier transmises avant la séance 1/2',
        'Pièces du dossier transmises avant la séance 2/2',
      ]);
    });

    it('[9] commence la page suivante par les pièces restantes, puis la complète de lignes à remplir', () => {
      const [, deuxiemePage] = pagesDesPieces(slides);

      expect(texteDeLaLigneDePiece(deuxiemePage, 1, 'intitule')).toBe(
        'Pièce 17'
      );
      expect(texteDeLaLigneDePiece(deuxiemePage, 4, 'intitule')).toBe(
        'Pièce 20'
      );
      expect(nomsDesFormes(deuxiemePage)).toContain(
        'piece-5-a-completer-intitule-texte'
      );
    });

    it('[13] utilise des lignes régulières sur toutes les pages', () => {
      const ordonneeDansLaPage = (page: string) => (numero: number) =>
        cadreDeLaForme(page, nomDeLaLigneDePiece(numero, 'case')).y;

      pagesDesPieces(slides).forEach((page) => {
        const ordonnee = ordonneeDansLaPage(page);
        expect(ordonnee(4) - ordonnee(3)).toBe(ordonnee(12) - ordonnee(11));
      });
    });
  });

  describe('sur le contexte', () => {
    it('[15] réduit la police de la description à 16 pt quand elle dépasse deux lignes à 21 pt', () => {
      expect([
        ...new Set(
          taillesDePolice(slideDuContexte(slides), DESCRIPTION_DU_CONTEXTE)
        ),
      ]).toEqual(['1600']);
    });
  });

  describe('sur les objectifs de sécurité', () => {
    const BAS_DE_L_ENCART_ANSSI = 6295579 + 1828577;
    const DESCENTE_SANS_ENCART = BAS_DE_L_ENCART_ANSSI - (5251772 + 929506);
    const ECART_ENTRE_PASTILLES = 114300;

    it("[29] illustre le niveau avec l'illustration de MonServiceSécurisé", async () => {
      const illustration = await imageDeLaForme(
        pptx,
        positionDeLaSlideAvecLaForme(slides, 'besoins-niveau'),
        'besoins-illustration'
      );

      expect(
        illustration.equals(
          await readFile('src/vuesPowerpoint/illustrationsNiveaux/niveau2.png')
        )
      ).toBe(true);
    });

    it("[34] agrandit l'ouverture et descend l'audience et la durée d'une ligne quand l'ouverture dépasse une ligne", async () => {
      const HAUTEUR_D_UNE_LIGNE = 308595;
      const modele = await slideDuModele(SLIDE_BESOINS_DE_SECURITE);
      const besoins = slideDesBesoins(slides);

      expect(cadreDeLaForme(besoins, 'exposition-ouverture').hauteur).toBe(
        cadreDeLaForme(modele, 'exposition-ouverture').hauteur +
          HAUTEUR_D_UNE_LIGNE
      );
      [
        'exposition-audience-libelle',
        'exposition-audience',
        'exposition-duree-libelle',
        'exposition-duree',
      ].forEach((forme) =>
        expect(cadreDeLaForme(besoins, forme).y).toBe(
          cadreDeLaForme(modele, forme).y + HAUTEUR_D_UNE_LIGNE
        )
      );
    });

    it('[44] prennent toute la largeur et passent sur deux lignes quand leur texte dépasse une ligne', () => {
      const [longue, suivante] = pastillesDesDonnees(slideDesBesoins(slides));

      expect(longue.largeur).toBe(4381500);
      expect(longue.hauteur).toBe(784771);
      expect(suivante.y).toBe(
        longue.y + longue.hauteur + ECART_ENTRE_PASTILLES
      );
      expect(suivante.hauteur).toBe(487635);
    });

    it("[46] retire l'encart quand le niveau choisi n'est pas supérieur à celui identifié par l'ANSSI", () => {
      expect(
        nomsDesFormesCommencantPar(slideDesBesoins(slides), 'besoins-anssi-')
      ).toEqual([]);
    });

    it("[47] descend le niveau et son résumé à la place de l'encart quand le niveau choisi est celui recommandé", () => {
      const besoins = slideDesBesoins(slides);

      const resume = cadreDeLaForme(besoins, 'besoins-resume');
      expect(resume.y + resume.hauteur).toBe(BAS_DE_L_ENCART_ANSSI);
      expect(cadreDeLaForme(besoins, 'besoins-niveau').y).toBe(
        4661222 + DESCENTE_SANS_ENCART
      );
    });

    it("[48] agrandit l'illustration jusqu'au niveau, en gardant ses proportions et son axe, quand le niveau choisi est celui recommandé", () => {
      const besoins = slideDesBesoins(slides);

      const illustration = cadreDeLaForme(besoins, 'besoins-illustration');
      const niveau = cadreDeLaForme(besoins, 'besoins-niveau');
      expect(illustration.y).toBe(2918147);
      expect(niveau.y - (illustration.y + illustration.hauteur)).toBe(114300);
      expect(illustration.largeur).toBe(illustration.hauteur);
      expect(illustration.x + illustration.largeur / 2).toBeCloseTo(
        3028950 + 1714500 / 2,
        -1
      );
    });
  });

  describe('sur la cartographie des risques bruts', () => {
    const pagesDesRisquesBruts = () =>
      pagesDeLaCartographie(slides, 'Cartographie des risques bruts');

    it('[58] ne met pas plus de 7 risques par page, le nombre de lignes du modèle', () => {
      expect(pagesDesRisquesBruts().map(identifiantsDesRisques)).toEqual([
        IDENTIFIANTS_DES_RISQUES_BRUTS.slice(0, 7),
        IDENTIFIANTS_DES_RISQUES_BRUTS.slice(7),
      ]);
    });

    it('[59] numérote les pages dans le titre', () => {
      expect(
        pagesDesRisquesBruts().map((page) =>
          texteDeLaForme(page, 'cartographie-titre')
        )
      ).toEqual([
        'Cartographie des risques bruts 1/2',
        'Cartographie des risques bruts 2/2',
      ]);
    });

    it("[62] réduit la police d'une case dont les identifiants dépassent trois lignes en 18 pt", () => {
      const [premierePage] = pagesDesRisquesBruts();

      expect(taillesDePolice(premierePage, 'matrice-g4-v4')).toEqual(['1400']);
    });
  });

  describe("sur l'analyse de risques complémentaire et le plan d'action", () => {
    const slideApresLaCartographieCible = (decalage: number) => {
      const [cartographieCible] = pagesDeLaCartographie(
        slides,
        'Cartographie des risques résiduels cible'
      );
      return slides[slides.indexOf(cartographieCible) + decalage];
    };

    it("[64] ne la présente pas comme optionnelle pour un service qui n'est pas en niveau basique", () => {
      expect(textesDeLaSlide(slideApresLaCartographieCible(1))).toContain(
        'Analyse de risques complémentaire'
      );
    });

    it("[66] ne le présente pas comme optionnel pour un service qui n'est pas en niveau basique", () => {
      expect(texteDeLaForme(slideApresLaCartographieCible(2), 'titre')).toBe(
        'Plan d’action'
      );
    });
  });

  describe('sur les statistiques des mesures', () => {
    it('[75] accorde au singulier une seule mesure proposée ou ajoutée', () => {
      expect(
        texteDeLaForme(slideDesStatistiques(slides), 'mesures-total')
      ).toBe("Total : 1 mesure proposée par l'ANSSI + 1 ajoutée par l’équipe.");
    });

    it('[80] retire les lignes sans catégorie', () => {
      const slide = slideDesStatistiques(slides);

      expect(nomsDesFormesCommencantPar(slide, 'categorie-4-')).toEqual([]);
      expect(textesDeLaSlide(slide)).not.toContain('Résilience');
    });

    it('[82] découpe chaque barre en un segment par statut, proportionnel à son nombre de mesures', () => {
      const slide = slideDesStatistiques(slides);

      const barre = cadreDeLaForme(slide, 'criticite-indispensables-barre');
      const segments = ['fait', 'enCours', 'nonFait', 'aLancer'].map((statut) =>
        cadreDeLaForme(slide, `criticite-indispensables-${statut}`)
      );
      expect(segments.map(({ largeur }) => largeur)).toEqual(
        [2, 25, 3, 6].map((nombre) => Math.round((barre.largeur * nombre) / 50))
      );
      expect(segments[0].x).toBe(barre.x);
      [1, 2, 3].forEach((index) =>
        expect(segments[index].x).toBe(
          segments[index - 1].x + segments[index - 1].largeur
        )
      );
    });
  });

  describe('sur les exigences restantes', () => {
    it('[94] répartit les exigences sur plusieurs pages, selon la hauteur de leurs lignes', () => {
      const descriptions = donnees.exigencesRestantes.map(
        ({ description }) => description
      );

      expect(pagesDesExigences(slides).map(descriptionsDesExigences)).toEqual([
        descriptions.slice(0, 4),
        descriptions.slice(4),
      ]);
    });
  });

  describe('sur les avis des membres', () => {
    it("[107] remplit 4 emplacements par page dans l'ordre des avis, une carte agrandie en prenant 2", () => {
      const pages = pagesDesAvis(slides);

      expect(pages.map(membresDesAvis)).toEqual([
        ['A', 'B', 'C'],
        ['D', 'E', 'F'],
        ['G'],
      ]);
      expect(
        pages.map((page) =>
          nomsDesFormes(page)
            .filter((nom) => /^avis-\d-carte$/.test(nom))
            .map((nom) => cadreDeLaForme(page, nom).largeur)
        )
      ).toEqual([
        [3952875, 3952875, 3952875],
        [8172450, 3952875, 3952875],
        [8172450],
      ]);
    });
  });

  describe("sur l'annexe des mesures", () => {
    it('[116] ne met pas plus de 9 mesures par page, le nombre de lignes du modèle', () => {
      expect(
        slidesDeLAnnexe(slides).map(
          (page) => descriptionsDesMesures(page).length
        )
      ).toEqual([9, 3]);
    });
  });

  describe('sur la description des risques', () => {
    it('[122] répartit les risques sur plusieurs pages, selon la hauteur de leurs lignes', () => {
      const pages = pagesDeLaDescriptionDesRisques(slides);

      expect(pages.map(identifiantsDeLaDescriptionDesRisques)).toEqual([
        ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'],
        ['R8'],
      ]);
      pages.forEach((page) =>
        expect(texteDeLaForme(page, 'description-risques-total')).toBe(
          '8 risques'
        )
      );
    });

    it('[123] numérote les pages dans le titre', () => {
      expect(
        pagesDeLaDescriptionDesRisques(slides).map((page) =>
          texteDeLaForme(page, 'description-risques-titre')
        )
      ).toEqual(['Description des risques 1/2', 'Description des risques 2/2']);
    });
  });
});

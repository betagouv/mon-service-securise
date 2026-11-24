import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import {
  svgIndiceCyber,
  svgIndiceCyberPersonnalise,
} from '../../src/adaptateurs/indiceCyberSvg.js';
import { svgEnPng } from '../../src/adaptateurs/automizer/svgEnPng.js';
import {
  LARGEUR_DES_JAUGES,
  LARGEUR_DU_RADAR,
} from '../../src/adaptateurs/automizer/slides/indiceCyber.js';
import { svgRadarIndiceCyber } from '../../src/adaptateurs/automizer/radarIndiceCyberSvg.js';
import {
  cadreDeLaForme,
  contenusDesSlides,
  elementsDeLaSlide,
  fichiersNonCompresses,
  formeNommee,
  identifiantsDeFormesEnDouble,
  imageDeLaForme,
  nomsDesFormes,
  nomsDesFormesCommencantPar,
  paragraphesDeLaForme,
  partiesDeclarees,
  partiesDeclareesAbsentes,
  relationsCassees,
  taillesDePolice,
  texteDeLaForme,
  texteDeLaSlide,
  textesDeLaSlide,
} from '../aides/lecturePptx.js';
import {
  DESCRIPTION_DU_CONTEXTE,
  pagesDeLaCartographie,
  pagesDesAvis,
  pagesDesPieces,
  pastillesDesDonnees,
  positionDeLaSlideAvecLaForme,
  slideAvecLaForme,
  slideDeLIndiceCyber,
  slideDesBesoins,
  slideDesStatistiques,
  slideDuContexte,
  texteDeLaLigneDePiece,
  nomsDesPastilles,
} from '../aides/lectureSupportCommission.js';
import {
  unAvis,
  uneCategorie,
  uneCriticite,
  uneExigence,
  unRisque,
  unSupportDeCommission,
} from '../constructeurs/constructeurSupportCommissionHomologation.js';

const donnees = unSupportDeCommission()
  .avecContexte({
    description:
      'Un portail de démarches en ligne\n\nOuvert aux usagers de la commune',
    organisation: 'Commune de Saint-Ours (987 654 321 00020)',
    statut: 'En conception',
    urls: 'https://rh.exemple.fr',
    typeDeProjet: 'Application mobile',
    hebergement: 'Autre',
    donneesStockees: "En partie ou totalement hors de l'Union européenne",
    securisations: 'Un annuaire',
  })
  .avecBesoinsDeSecurite({
    idNiveau: 'niveau1',
    niveau: 'Modérés',
    resume: 'Les besoins de sécurité sont modérés.',
    demarche: 'intermédiaire',
    niveauIndicatifAnssi: 'Basiques',
    depasseRecommandation: true,
    nomService: 'Portail des démarches',
  })
  .avecExposition({
    ouverture: 'Accessible depuis internet',
    audience: "Large : Utilisé à l'échelle nationale.",
    dureeDysfonctionnement: 'Moins de 4h',
  })
  .avecDonneesIdentifiees(
    'Données techniques',
    'Agendas',
    'Documents RH sensibles'
  )
  .avecRisquesBruts(
    unRisque('R3', { gravite: 4, vraisemblance: 4 }),
    unRisque('R7', { gravite: 4, vraisemblance: 4 }),
    unRisque('RS1', { gravite: 2, vraisemblance: 1 })
  )
  .avecRisquesADate(
    unRisque('R1', { gravite: 2, vraisemblance: 2, niveau: 'faible' }),
    unRisque('RS1', { gravite: 2, vraisemblance: 2, niveau: 'faible' })
  )
  .avecRisquesCibles(unRisque('R3', { niveau: 'eleve' }))
  .avecIndiceCyber({
    nomService: 'Mon service',
    total: 2.43,
    totalPersonnalise: 2.6,
    noteMax: 5,
    categories: [
      { libelle: 'Gouvernance', note: 3.2 },
      { libelle: 'Protection', note: 1.8 },
    ],
    referentiels: "l'ANSSI et la CNIL",
  })
  .avecStatistiquesDesMesures({
    nombreDeMesuresGenerales: 113,
    nombreDeMesuresSpecifiques: 4,
    referentiels: "l'ANSSI et la CNIL",
  })
  .avecCategories(
    uneCategorie('Gouvernance', { fait: 19, aLancer: 2, aRemplir: 5 }),
    uneCategorie('Protection', {
      fait: 15,
      enCours: 2,
      nonFait: 3,
      aRemplir: 51,
    }),
    uneCategorie('Défense', { aRemplir: 10 }),
    uneCategorie('Résilience', {
      fait: 1,
      enCours: 1,
      aLancer: 1,
      aRemplir: 2,
    })
  )
  .avecCriticites({
    indispensables: uneCriticite({ restant: 48 }),
    recommandees: uneCriticite({ restant: 1 }),
  })
  .avecExigencesRestantes(
    uneExigence('Identifier les engagements des prestataires', {
      statut: 'enCours',
      echeance: '31/12/2026',
      porteurs: 'Équipe projet et prestataire',
    }),
    uneExigence('Tester la restauration des sauvegardes', {
      statut: 'aLancer',
    })
  )
  .avecAvis(
    unAvis('Jean Dupond', {
      avis: 'Favorable',
      commentaire: 'Revoir la politique de mots de passe',
    }),
    unAvis('Ludmilla Cara, Thomas Berthelot', {
      avis: 'Favorable avec réserve : mettre en place le MFA',
      duree: '6 mois',
      commentaire: 'Ok\n\nÀ revoir',
    })
  )
  .construis();

describe("Le support de commission d'homologation du groupe 1", () => {
  let pptx: Buffer;
  let slides: string[];

  beforeAll(async () => {
    pptx =
      await new AdaptateurPowerpointAutomizer().genereSupportCommissionHomologation(
        donnees
      );
    slides = await contenusDesSlides(pptx);
  });

  const slideEnPosition = (position: number) => slides[position - 1];

  it('[1] contient tous les slides, dans le bon ordre', () => {
    expect(slides).toHaveLength(28);
    expect(textesDeLaSlide(slideEnPosition(1))).toContain(
      'Support de commission d’homologation'
    );
    expect(textesDeLaSlide(slideEnPosition(2))).toContain('Sommaire');
    expect(textesDeLaSlide(slideEnPosition(3))).toContain(
      'Composition de la commission'
    );
    const pagePieces = slideEnPosition(4);
    expect(textesDeLaSlide(pagePieces)).toContain(
      'Pièces du dossier transmises avant la séance'
    );
    expect(texteDeLaSlide(pagePieces)).not.toContain(
      'Composition de la commission et contenu du dossier'
    );
    const presentationDuSysteme = slideEnPosition(5);
    expect(textesDeLaSlide(presentationDuSysteme)).toContain(
      '1. Présentation du système'
    );
    expect(textesDeLaSlide(presentationDuSysteme)).toContain('Logo');
    expect(textesDeLaSlide(slideEnPosition(6))).toContain('Contexte');
    expect(textesDeLaSlide(slideEnPosition(7))).toContain(
      'Périmètre de l’analyse : Vue fonctionnelle'
    );
    expect(textesDeLaSlide(slideEnPosition(8))).toContain(
      'Périmètre de l’analyse : Description technique'
    );
    expect(textesDeLaSlide(slideEnPosition(9))).toContain(
      'Objectifs de sécurité, impacts et exposition'
    );
    const intercalaireHistorique = slideEnPosition(10);
    expect(textesDeLaSlide(intercalaireHistorique)).toContain('2. Historique');
    expect(textesDeLaSlide(intercalaireHistorique)).toContain('Logo');
    expect(textesDeLaSlide(slideEnPosition(11))).toContain('EVÈNEMENT');
    expect(textesDeLaSlide(slideEnPosition(12))).toContain(
      '3. Détail : Risques et plan d’action'
    );
    expect(textesDeLaSlide(slideEnPosition(13))).toContain(
      'Cartographie des risques bruts'
    );
    expect(textesDeLaSlide(slideEnPosition(17))).toContain(
      'Analyse de risques complémentaire (optionnel)'
    );
    expect(textesDeLaSlide(slideEnPosition(18))).toContain(
      'Plan d’action (optionnel)'
    );
    const intercalaireSocle = slideEnPosition(19);
    expect(textesDeLaSlide(intercalaireSocle)).toContain(
      '4. Détail : Socle et plan d’action'
    );
    expect(textesDeLaSlide(intercalaireSocle)).toContain('Logo');
    expect(textesDeLaSlide(slideEnPosition(20))).toContain(
      'Conformité : Indice cyber'
    );
    expect(textesDeLaSlide(slideEnPosition(21))).toContain(
      'Mesures de sécurité'
    );
    expect(textesDeLaSlide(slideEnPosition(22))).toContain(
      'Exigences à mettre en place restantes'
    );
    const intercalaireAudit = slideEnPosition(23);
    expect(textesDeLaSlide(intercalaireAudit)).toContain(
      '5. Détail : Audit et plan d’action'
    );
    expect(textesDeLaSlide(intercalaireAudit)).toContain('Logo');
    const resultatsDesAudits = slideEnPosition(24);
    expect(textesDeLaSlide(resultatsDesAudits)).toEqual(
      expect.arrayContaining([
        '5. Audits et plan d’action',
        'Résultats des audits',
      ])
    );
    expect(texteDeLaSlide(resultatsDesAudits)).toContain('NOM DES AUDITS');
    const intercalaireDecision = slideEnPosition(25);
    expect(textesDeLaSlide(intercalaireDecision)).toContain(
      '6. Proposition de décision'
    );
    expect(textesDeLaSlide(intercalaireDecision)).toContain('Logo');
    expect(textesDeLaSlide(slideEnPosition(26))).toContain(
      'Avis formalisés des membres'
    );
    expect(textesDeLaSlide(slideEnPosition(27))).toContain(
      'PROPOSITION DE DÉCISION'
    );
    expect(textesDeLaSlide(slideEnPosition(28))).toContain('Annexes');
  });

  it("[4] laisse l'autorité d'homologation à compléter par le projet quand elle n'est pas renseignée", () => {
    const commission = slideEnPosition(3);

    expect(nomsDesFormes(commission)).not.toContain('autorite-homologation');
    expect(nomsDesFormes(commission)).toContain(
      'autorite-homologation-a-completer-texte'
    );
  });

  it('[127] écrit la date de création au format court, après son libellé', () => {
    const couverture = slideEnPosition(1);

    expect(textesDeLaSlide(couverture)).toContain('Date de création : ');
    expect(textesDeLaSlide(couverture)).toContain('09/11/2026');
  });

  describe('sur la page des pièces du dossier', () => {
    it('[6] retire la version à compléter des lignes remplies', () => {
      const [page] = pagesDesPieces(slides);

      expect(nomsDesFormesCommencantPar(page, 'piece-1-a-completer-')).toEqual(
        []
      );
    });

    it('[7] laisse les lignes au-delà des pièces à compléter par le projet', () => {
      const [page] = pagesDesPieces(slides);

      expect(nomsDesFormes(page)).not.toContain('piece-2-intitule');
      expect(nomsDesFormes(page)).not.toContain('piece-2-source');
      expect(nomsDesFormes(page)).toContain(
        'piece-2-a-completer-intitule-texte'
      );
      expect(texteDeLaLigneDePiece(page, 2, 'case')).toBe('☐');
      expect(nomsDesFormes(page)).toContain(
        'piece-16-a-completer-reference-texte'
      );
    });
  });

  describe('sur le contexte', () => {
    const taillesDePoliceDeLaDescription = (slide: string) => [
      ...new Set(taillesDePolice(slide, DESCRIPTION_DU_CONTEXTE)),
    ];

    it("[14] remplace le placeholder par la description du système d'information", () => {
      const contexte = slideDuContexte(slides);

      expect(texteDeLaSlide(contexte)).not.toContain('Portail RH permettant');
      expect(textesDeLaSlide(contexte)).toContain(
        'Un portail de démarches en ligne'
      );
    });

    it('[17] compte chaque saut de ligne de la description comme une nouvelle ligne', () => {
      expect(taillesDePoliceDeLaDescription(slideDuContexte(slides))).toEqual([
        '1600',
      ]);
    });

    it('[20] écrit chaque ligne de la description dans son propre paragraphe', () => {
      expect(
        paragraphesDeLaForme(slideDuContexte(slides), DESCRIPTION_DU_CONTEXTE)
      ).toEqual([
        'Un portail de démarches en ligne',
        '',
        'Ouvert aux usagers de la commune',
      ]);
    });

    it("[21] écrit l'organisation responsable", () => {
      const contexte = slideDuContexte(slides);

      expect(texteDeLaSlide(contexte)).not.toContain('Commune de Villeneuve');
      expect(textesDeLaSlide(contexte)).toContain(
        'Commune de Saint-Ours (987 654 321 00020)'
      );
    });

    it('[22] écrit le statut de déploiement', () => {
      const contexte = slideDuContexte(slides);

      expect(texteDeLaSlide(contexte)).not.toContain('En production');
      expect(textesDeLaSlide(contexte)).toContain('En conception');
    });

    it('[23] écrit les URL du projet', () => {
      const contexte = slideDuContexte(slides);

      expect(texteDeLaSlide(contexte)).not.toContain(
        'https://rh.villeneuve.fr'
      );
      expect(textesDeLaSlide(contexte)).toContain('https://rh.exemple.fr');
    });

    it('[24] écrit le type de projet', () => {
      const contexte = slideDuContexte(slides);

      expect(texteDeLaSlide(contexte)).not.toContain(
        'Service en ligne, Portail'
      );
      expect(textesDeLaSlide(contexte)).toContain('Application mobile');
    });

    it("[25] écrit l'hébergement", () => {
      const contexte = slideDuContexte(slides);

      expect(texteDeLaSlide(contexte)).not.toContain(
        'Le système est entièrement fourni'
      );
      expect(textesDeLaSlide(contexte)).toContain('Autre');
    });

    it('[26] écrit la localisation des données stockées', () => {
      const contexte = slideDuContexte(slides);

      expect(texteDeLaSlide(contexte)).not.toContain(
        'Au sein de l’Union européenne'
      );
      expect(textesDeLaSlide(contexte)).toContain(
        "En partie ou totalement hors de l'Union européenne"
      );
    });

    it('[27] écrit les sécurisations prévues', () => {
      const contexte = slideDuContexte(slides);

      expect(texteDeLaSlide(contexte)).not.toContain('Des postes de travail');
      expect(textesDeLaSlide(contexte)).toContain('Un annuaire');
    });
  });

  describe('sur les objectifs de sécurité', () => {
    const ECART_ENTRE_PASTILLES = 114300;

    it('[28] écrit le niveau de besoin de sécurité', () => {
      expect(texteDeLaForme(slideDesBesoins(slides), 'besoins-niveau')).toBe(
        'Modérés'
      );
    });

    it('[30] écrit le résumé du niveau', () => {
      expect(texteDeLaForme(slideDesBesoins(slides), 'besoins-resume')).toBe(
        'Les besoins de sécurité sont modérés.'
      );
    });

    it('[31] écrit la démarche indicative adaptée, en majuscules', () => {
      expect(texteDeLaForme(slideDesBesoins(slides), 'besoins-demarche')).toBe(
        'DÉMARCHE INDICATIVE ADAPTÉE : INTERMÉDIAIRE'
      );
    });

    it("[32] écrit le nom du service et le niveau dans l'explication par le projet", () => {
      const explication = texteDeLaForme(
        slideDesBesoins(slides),
        'besoins-explication'
      );

      expect(explication).toContain(
        'Dans le cadre du projet Portail des démarches, le système'
      );
      expect(explication).toContain(
        'MonServiceSécurisé, soit Modérés, apparaît'
      );
    });

    it("[33] écrit l'exposition du service", () => {
      const besoins = slideDesBesoins(slides);

      expect(texteDeLaForme(besoins, 'exposition-ouverture')).toBe(
        'Accessible depuis internet'
      );
      expect(texteDeLaForme(besoins, 'exposition-audience')).toBe(
        "Large : Utilisé à l'échelle nationale."
      );
      expect(texteDeLaForme(besoins, 'exposition-duree')).toBe('Moins de 4h');
    });

    it('[35] écrit une pastille par donnée identifiée, à la place de la pastille modèle', () => {
      const besoins = slideDesBesoins(slides);

      expect(
        [1, 2, 3].map((numero) =>
          texteDeLaForme(besoins, `donnee-identifiee-${numero}`)
        )
      ).toEqual(['Données techniques', 'Agendas', 'Documents RH sensibles']);
      expect(nomsDesFormes(besoins)).not.toContain('donnee-identifiee-4');
      expect(nomsDesFormes(besoins)).not.toContain('donnee-identifiee');
    });

    describe('pour les pastilles des données identifiées', () => {
      it('[36] gardent la police de 18 pt quand elles tiennent dans la carte', () => {
        const besoins = slideDesBesoins(slides);

        expect([
          ...new Set(
            nomsDesPastilles(besoins).flatMap((nom) =>
              taillesDePolice(besoins, nom)
            )
          ),
        ]).toEqual(['1800']);
      });

      it("[40] les place côte à côte tant qu'elles tiennent sur la ligne", () => {
        const [premiere, seconde] = pastillesDesDonnees(
          slideDesBesoins(slides)
        );

        expect(seconde.y).toBe(premiere.y);
        expect(seconde.x).toBe(
          premiere.x + premiere.largeur + ECART_ENTRE_PASTILLES
        );
      });

      it('[41] adaptent leur largeur à leur texte', () => {
        const [courte, , longue] = pastillesDesDonnees(slideDesBesoins(slides));

        expect(longue.largeur).toBeGreaterThan(courte.largeur);
      });

      it('[42] sont assez larges pour que leur texte tienne sur une ligne, au gras italique de 18 pt', () => {
        const LARGEUR_DE_DOCUMENTS_RH_SENSIBLES_AU_RENDU = 3048819;
        const [, , documentsRhSensibles] = pastillesDesDonnees(
          slideDesBesoins(slides)
        );

        expect(documentsRhSensibles.largeur).toBeGreaterThanOrEqual(
          LARGEUR_DE_DOCUMENTS_RH_SENSIBLES_AU_RENDU
        );
      });

      it('[43] passent à la ligne quand la pastille ne tient plus sur la ligne', () => {
        const [premiere, , troisieme] = pastillesDesDonnees(
          slideDesBesoins(slides)
        );

        expect(troisieme.x).toBe(premiere.x);
        expect(troisieme.y).toBe(
          premiere.y + premiere.hauteur + ECART_ENTRE_PASTILLES
        );
      });
    });

    it("[45] nomme, dans l'encart, le niveau identifié à titre indicatif par l'ANSSI", () => {
      expect(
        texteDeLaForme(slideDesBesoins(slides), 'besoins-anssi-titre')
      ).toBe(
        'Ce niveau est supérieur à celui identifié à titre indicatif par l’ANSSI (Basiques).'
      );
    });
  });

  describe('sur la cartographie des risques bruts', () => {
    const cartographie = () =>
      pagesDeLaCartographie(slides, 'Cartographie des risques bruts')[0];

    it('[49] écrit dans chaque case de la matrice les identifiants de ses risques', () => {
      expect(texteDeLaForme(cartographie(), 'matrice-g4-v4')).toBe('R3, R7');
      expect(texteDeLaForme(cartographie(), 'matrice-g2-v1')).toBe('RS1');
      expect(texteDeLaForme(cartographie(), 'matrice-g1-v1')).toBe('');
      expect(texteDeLaSlide(cartographie())).not.toContain(
        'R3, R7, R9, R11, R14'
      );
      expect(textesDeLaSlide(cartographie())).not.toContain('R1, R5');
    });

    it('[50] écrit le nombre de risques en tête de la liste', () => {
      expect(texteDeLaForme(cartographie(), 'liste-risques-total')).toBe(
        '3 RISQUES'
      );
    });

    it("[51] écrit l'identifiant et l'intitulé de chaque risque, et retire les lignes inutilisées", () => {
      expect(
        [1, 2, 3].map((numero) => [
          texteDeLaForme(cartographie(), `risque-${numero}-identifiant`),
          texteDeLaForme(cartographie(), `risque-${numero}-intitule`),
        ])
      ).toEqual([
        ['R3', 'Intitulé de R3'],
        ['R7', 'Intitulé de R7'],
        ['RS1', 'Intitulé de RS1'],
      ]);
      expect(nomsDesFormesCommencantPar(cartographie(), 'risque-4-')).toEqual(
        []
      );
      expect(texteDeLaSlide(cartographie())).not.toContain(
        'Compromission d’un poste de travail'
      );
    });

    it('[60] ne numérote pas le titre quand les risques tiennent sur une page', () => {
      expect(texteDeLaForme(cartographie(), 'cartographie-titre')).toBe(
        'Cartographie des risques bruts'
      );
    });

    it('[61] garde la police de 18 pt dans une case qui contient peu de risques', () => {
      expect(taillesDePolice(cartographie(), 'matrice-g4-v4')).toEqual([
        '1800',
      ]);
    });
  });

  describe('sur les cartographies à date et résiduelle cible', () => {
    it('[63] suivent la cartographie brute et la description des risques, chacune avec son titre et ses risques', () => {
      const titreEtRisque = (position: number) => {
        const slide = slideEnPosition(position);
        return [
          texteDeLaForme(slide, 'cartographie-titre'),
          texteDeLaForme(slide, 'risque-1-identifiant'),
        ];
      };

      expect(titreEtRisque(13)).toEqual([
        'Cartographie des risques bruts',
        'R3',
      ]);
      expect(titreEtRisque(15)).toEqual([
        'Cartographie des risques à date',
        'R1',
      ]);
      expect(titreEtRisque(16)).toEqual([
        'Cartographie des risques résiduels cible',
        'R3',
      ]);
    });
  });

  describe("sur l'analyse de risques complémentaire", () => {
    it('[65] la présente comme optionnelle pour un service en niveau basique', () => {
      expect(textesDeLaSlide(slideEnPosition(17))).toContain(
        'Analyse de risques complémentaire (optionnel)'
      );
    });
  });

  describe("sur le plan d'action", () => {
    it('[67] le présente comme optionnel pour un service en niveau basique', () => {
      expect(texteDeLaForme(slideEnPosition(18), 'titre')).toBe(
        'Plan d’action (optionnel)'
      );
    });
  });

  describe("sur l'indice cyber", () => {
    const ESPACE_DE_NOMS_SVG =
      'http://schemas.microsoft.com/office/drawing/2016/SVG/main';

    const imageDeLIndiceCyber = async (forme: string) =>
      imageDeLaForme(
        pptx,
        positionDeLaSlideAvecLaForme(slides, 'indice-cyber-texte'),
        forme
      );

    it('[68] écrit le nom du service et ses deux indices, arrondis au dixième', () => {
      expect(
        texteDeLaForme(slideDeLIndiceCyber(slides), 'indice-cyber-texte')
      ).toBe(
        'Le socle de sécurité a été réalisé via l’outil MonServiceSécurisé. L’indice cyber ANSSI de Mon service calculé est de 2,4/5, et l’indice cyber personnalisé est de 2,6/5.'
      );
    });

    it("[69] dessine la jauge de l'indice cyber ANSSI", async () => {
      const jauge = await imageDeLIndiceCyber('indice-cyber-jauge');

      expect(
        jauge.equals(svgEnPng(svgIndiceCyber(2.43, 5), LARGEUR_DES_JAUGES))
      ).toBe(true);
    });

    it("[70] dessine la jauge de l'indice cyber personnalisé", async () => {
      const jauge = await imageDeLIndiceCyber(
        'indice-cyber-jauge-personnalisee'
      );

      expect(
        jauge.equals(
          svgEnPng(svgIndiceCyberPersonnalise(2.6, 5), LARGEUR_DES_JAUGES)
        )
      ).toBe(true);
    });

    it("[71] dessine le radar de l'indice cyber par catégorie", async () => {
      const radar = await imageDeLIndiceCyber('indice-cyber-radar');

      expect(
        radar.equals(
          svgEnPng(
            svgRadarIndiceCyber(donnees.indiceCyber.categories, 5),
            LARGEUR_DU_RADAR
          )
        )
      ).toBe(true);
    });

    it("[72] n'affiche pas la variante SVG figée du modèle à la place des jauges", () => {
      expect(
        elementsDeLaSlide(
          slideDeLIndiceCyber(slides),
          ESPACE_DE_NOMS_SVG,
          'svgBlip'
        )
      ).toEqual([]);
    });

    it("[73] nomme les référentiels des mesures sur lesquelles l'indice est calculé", () => {
      const slide = slideDeLIndiceCyber(slides);

      expect(texteDeLaForme(slide, 'indice-cyber-referentiels')).toBe(
        "Calculé sur les mesures proposées par l'ANSSI et la CNIL"
      );
      expect(texteDeLaForme(slide, 'indice-cyber-explication')).toBe(
        "L’indice cyber est calculé sur la base des informations renseignées par l’équipe concernant les mesures de sécurité proposées par l'ANSSI et la CNIL, et à l’exclusion des mesures spécifiques ajoutées. Il fournit une évaluation indicative du niveau de sécurisation du service."
      );
    });
  });

  describe('sur les statistiques des mesures', () => {
    it("[74] écrit le nombre de mesures proposées par les référentiels et ajoutées par l'équipe", () => {
      expect(
        texteDeLaForme(slideDesStatistiques(slides), 'mesures-total')
      ).toBe(
        "Total : 113 mesures proposées par l'ANSSI et la CNIL + 4 ajoutées par l’équipe."
      );
    });

    it('[76] légende les statuts avec les couleurs de MonServiceSécurisé', () => {
      const slide = slideDesStatistiques(slides);
      const couleur = (nom: string) =>
        formeNommee(slide, nom)
          .getElementsByTagName('a:srgbClr')[0]
          .getAttribute('val');

      expect(
        ['fait', 'enCours', 'nonFait', 'aLancer', 'aDefinir'].map((statut) => [
          couleur(`legende-${statut}-texte`),
          couleur(`legende-${statut}-fond`),
        ])
      ).toEqual([
        ['0C8626', 'D4F4DB'],
        ['0079D0', 'DBEEFF'],
        ['FAA72C', 'FFF2DE'],
        ['7025DA', 'E9DDFF'],
        ['667892', 'F1F5F9'],
      ]);
    });

    it('[77] borde la légende « Statut à définir » de gris pour la détacher du fond de la slide', () => {
      const bordure = formeNommee(
        slideDesStatistiques(slides),
        'legende-aDefinir-fond'
      )
        .getElementsByTagName('a:ln')[0]
        .getElementsByTagName('a:srgbClr')[0];

      expect(bordure?.getAttribute('val')).toBe('94A3B8');
    });

    describe('par catégorie', () => {
      it('[78] écrit le libellé et le nombre de mesures de chaque catégorie', () => {
        const slide = slideDesStatistiques(slides);

        expect(
          [1, 2, 3, 4].map((numero) => [
            texteDeLaForme(slide, `categorie-${numero}-libelle`),
            texteDeLaForme(slide, `categorie-${numero}-total`),
          ])
        ).toEqual([
          ['Gouvernance', '26'],
          ['Protection', '71'],
          ['Défense', '10'],
          ['Résilience', '5'],
        ]);
      });

      it('[79] découpe la barre de chaque catégorie en segments proportionnels, sans les statuts vides', () => {
        const slide = slideDesStatistiques(slides);

        const barre = cadreDeLaForme(slide, 'categorie-2-barre');
        const segments = ['fait', 'enCours', 'nonFait'].map((statut) =>
          cadreDeLaForme(slide, `categorie-2-${statut}`)
        );
        expect(segments.map(({ largeur }) => largeur)).toEqual(
          [15, 2, 3].map((nombre) => Math.round((barre.largeur * nombre) / 71))
        );
        expect(segments.map(({ x }) => x)).toEqual([
          barre.x,
          barre.x + segments[0].largeur,
          barre.x + segments[0].largeur + segments[1].largeur,
        ]);
        expect(nomsDesFormesCommencantPar(slide, 'categorie-3-')).toEqual([
          'categorie-3-libelle',
          'categorie-3-barre',
          'categorie-3-total',
        ]);
      });
    });

    describe('par niveau de criticité', () => {
      it('[81] écrit le nombre de mesures restant à mettre en œuvre, au singulier ou au pluriel', () => {
        const slide = slideDesStatistiques(slides);

        expect(texteDeLaForme(slide, 'criticite-indispensables-restant')).toBe(
          'Il reste 48 mesures à mettre en œuvre'
        );
        expect(texteDeLaForme(slide, 'criticite-recommandees-restant')).toBe(
          'Il reste 1 mesure à mettre en œuvre'
        );
      });
    });
  });

  describe('sur les exigences restantes', () => {
    const slideDesExigences = () =>
      slideAvecLaForme(slides, 'exigences-restantes-titre');

    it('[84] écrit une ligne par exigence : description, statut, échéance et porteurs', () => {
      expect(
        [1, 2].map((numero) =>
          ['description', 'statut-texte', 'echeance', 'porteurs'].map(
            (partie) =>
              texteDeLaForme(
                slideDesExigences(),
                `exigence-${numero}-${partie}`
              )
          )
        )
      ).toEqual([
        [
          'Identifier les engagements des prestataires',
          'PARTIELLE',
          '31/12/2026',
          'Équipe projet et prestataire',
        ],
        ['Tester la restauration des sauvegardes', 'À LANCER', '', ''],
      ]);
    });

    it('[97] garde le titre sur une ligne avec une pagination à deux chiffres, sans toucher la pastille « Prérempli »', () => {
      const largeurDeTitreAvec99Sur99EnArialGras = 10750115;
      const margesInternesDuCadre = 2 * 25400;

      const titre = cadreDeLaForme(
        slideDesExigences(),
        'exigences-restantes-titre'
      );
      const pastille = cadreDeLaForme(
        slideDesExigences(),
        'pastille-prerempli'
      );

      expect(titre.largeur).toBeGreaterThanOrEqual(
        largeurDeTitreAvec99Sur99EnArialGras + margesInternesDuCadre
      );
      expect(titre.x + titre.largeur).toBeLessThan(pastille.x);
    });

    it('[98] retire les lignes sans exigence', () => {
      const slide = slideDesExigences();

      expect(
        nomsDesFormes(slide).filter((nom) => /^exigence-[3-5]-/.test(nom))
      ).toEqual([]);
      expect(nomsDesFormesCommencantPar(slide, 'exigence-1-')).toHaveLength(17);
    });
  });

  describe('sur les avis des membres', () => {
    const MARGE_DANS_LA_CARTE = 266700;
    const ECART_SOUS_UNE_VALEUR = 228600;
    const ECART_SOUS_UN_LIBELLE = 38100;
    const HAUTEUR_D_UN_LIBELLE = 300038;
    const HAUTEUR_D_UNE_VALEUR_SUR_UNE_LIGNE = 300038;
    const HAUTEUR_D_UNE_LIGNE_DE_VALEUR = 261937;
    const HAUTEUR_D_UNE_LIGNE_DES_MEMBRES = 355880;

    const slideDesAvis = () => pagesDesAvis(slides)[0];

    const basDe = (slide: string, nom: string) => {
      const { y, hauteur } = cadreDeLaForme(slide, nom);
      return y + hauteur;
    };

    it('[99] écrit une carte par avis : membres, avis, durée et commentaire', () => {
      const slide = slideDesAvis();

      expect(
        ['membres', 'avis', 'duree', 'commentaire'].map((partie) =>
          texteDeLaForme(slide, `avis-1-${partie}`)
        )
      ).toEqual([
        'Jean Dupond',
        'Favorable',
        '1 an',
        'Revoir la politique de mots de passe',
      ]);
      expect(
        ['membres', 'avis', 'duree'].map((partie) =>
          texteDeLaForme(slide, `avis-2-${partie}`)
        )
      ).toEqual([
        'Ludmilla Cara, Thomas Berthelot',
        'Favorable avec réserve : mettre en place le MFA',
        '6 mois',
      ]);
    });

    describe("pour la mise en page d'une carte", () => {
      it('[100] garde les textes dans la carte, avec la même marge à gauche et à droite', () => {
        const slide = slideDesAvis();

        const carte = cadreDeLaForme(slide, 'avis-2-carte');
        expect(
          [
            'membres',
            'libelle-avis',
            'avis',
            'libelle-duree',
            'duree',
            'libelle-commentaire',
            'commentaire',
          ].map((partie) => {
            const { x, largeur } = cadreDeLaForme(slide, `avis-2-${partie}`);
            return [x - carte.x, carte.x + carte.largeur - (x + largeur)];
          })
        ).toEqual(Array(7).fill([MARGE_DANS_LA_CARTE, MARGE_DANS_LA_CARTE]));
      });

      it('[101] écrit le commentaire avec un paragraphe par ligne, sans rétrécir la police', () => {
        const slide = slideDesAvis();

        expect(paragraphesDeLaForme(slide, 'avis-2-commentaire')).toEqual([
          'Ok',
          '',
          'À revoir',
        ]);
        expect(
          ['membres', 'avis', 'duree', 'commentaire'].map(
            (partie) =>
              formeNommee(slide, `avis-2-${partie}`).getElementsByTagName(
                'a:normAutofit'
              ).length
          )
        ).toEqual([0, 0, 0, 0]);
      });

      it('[102] empile chaque libellé sous la valeur qui le précède, et chaque valeur sous son libellé', () => {
        const slide = slideDesAvis();

        const y = (partie: string) =>
          cadreDeLaForme(slide, `avis-1-${partie}`).y;
        const bas = (partie: string) => basDe(slide, `avis-1-${partie}`);
        expect(cadreDeLaForme(slide, 'avis-1-avis').hauteur).toBe(
          HAUTEUR_D_UNE_VALEUR_SUR_UNE_LIGNE
        );
        expect([
          y('libelle-avis') - bas('membres'),
          y('avis') - bas('libelle-avis'),
          y('libelle-duree') - bas('avis'),
          y('duree') - bas('libelle-duree'),
          y('libelle-commentaire') - bas('duree'),
          y('commentaire') - bas('libelle-commentaire'),
        ]).toEqual([
          ECART_SOUS_UNE_VALEUR,
          ECART_SOUS_UN_LIBELLE,
          ECART_SOUS_UNE_VALEUR,
          ECART_SOUS_UN_LIBELLE,
          ECART_SOUS_UNE_VALEUR,
          ECART_SOUS_UN_LIBELLE,
        ]);
        expect(cadreDeLaForme(slide, 'avis-1-libelle-avis').hauteur).toBe(
          HAUTEUR_D_UN_LIBELLE
        );
      });

      it("[103] agrandit les membres et l'avis qui tiennent sur plusieurs lignes, sans rétrécir leur police", () => {
        const slide = slideDesAvis();

        const ecartDeHauteur = (partie: string) =>
          cadreDeLaForme(slide, `avis-2-${partie}`).hauteur -
          cadreDeLaForme(slide, `avis-1-${partie}`).hauteur;
        expect(ecartDeHauteur('membres')).toBe(HAUTEUR_D_UNE_LIGNE_DES_MEMBRES);
        expect(ecartDeHauteur('avis')).toBe(HAUTEUR_D_UNE_LIGNE_DE_VALEUR);
      });

      it("[104] étire le commentaire jusqu'au bas de la carte", () => {
        const slide = slideDesAvis();

        expect(basDe(slide, 'avis-1-commentaire')).toBe(
          basDe(slide, 'avis-1-carte') - MARGE_DANS_LA_CARTE
        );
      });
    });

    it('[109] garde le titre sur une ligne avec une pagination à deux chiffres, sans toucher la pastille « Prérempli »', () => {
      const largeurDuTitreDesExigencesAvec99Sur99EnArialGras = 10750115;
      const margesInternesDuCadre = 2 * 25400;

      const titre = cadreDeLaForme(slideDesAvis(), 'avis-titre');
      const pastille = cadreDeLaForme(slideDesAvis(), 'pastille-prerempli');

      expect(titre.largeur).toBeGreaterThanOrEqual(
        largeurDuTitreDesExigencesAvec99Sur99EnArialGras + margesInternesDuCadre
      );
      expect(titre.x + titre.largeur).toBeLessThan(pastille.x);
    });

    it('[111] retire le message « Aucun avis » quand le dossier a des avis', () => {
      expect(nomsDesFormes(slideDesAvis())).not.toContain('aucun-avis');
    });

    it('[112] retire les cartes sans avis', () => {
      const slide = slideDesAvis();

      expect(
        nomsDesFormes(slide).filter((nom) => /^avis-[3-4]-/.test(nom))
      ).toEqual([]);
      expect(nomsDesFormesCommencantPar(slide, 'avis-1-')).toHaveLength(9);
    });
  });

  describe('sur la description des risques', () => {
    it('[120] suit la cartographie brute et décrit chaque risque à date, en retirant les lignes inutilisées', () => {
      const description = slideEnPosition(14);

      expect(textesDeLaSlide(description)).toContain('Description des risques');
      expect(texteDeLaForme(description, 'description-risques-total')).toBe(
        '2 risques'
      );
      expect(
        [1, 2].map((numero) =>
          ['identifiant', 'intitule', 'description'].map((partie) =>
            texteDeLaForme(
              description,
              `description-risque-${numero}-${partie}`
            )
          )
        )
      ).toEqual([
        ['R1', 'Intitulé de R1', 'Description de R1'],
        ['RS1', 'Intitulé de RS1', 'Description de RS1'],
      ]);
      expect(
        nomsDesFormesCommencantPar(description, 'description-risque-3-')
      ).toEqual([]);
      expect(texteDeLaSlide(description)).not.toContain(
        'Un attaquant externe compromet'
      );
    });
  });

  describe('produit un fichier que PowerPoint ouvre sans le réparer', () => {
    it("[128] ne déclare chaque partie du fichier qu'une seule fois", async () => {
      const parties = await partiesDeclarees(pptx);

      const doublons = parties.filter(
        (partie, index) => parties.indexOf(partie) !== index
      );
      expect(doublons).toEqual([]);
    });

    it('[129] ne contient aucune relation vers une partie absente du fichier', async () => {
      expect(await relationsCassees(pptx)).toEqual([]);
    });

    it('[130] ne déclare aucune partie absente du fichier', async () => {
      expect(await partiesDeclareesAbsentes(pptx)).toEqual([]);
    });

    it("[131] compresse les fichiers de l'archive", () => {
      expect(fichiersNonCompresses(pptx)).toEqual([]);
    });

    it("[132] donne un identifiant unique à chaque forme d'une slide", async () => {
      expect(await identifiantsDeFormesEnDouble(pptx)).toEqual([]);
    });
  });
});

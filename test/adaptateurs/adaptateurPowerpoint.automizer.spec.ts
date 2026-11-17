import { readFile } from 'node:fs/promises';
import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import {
  cadreDeLaForme,
  contenuSlide,
  couleurDuFond,
  couleursDuTexte,
  fichiersNonCompresses,
  identifiantsDeFormesEnDouble,
  elementsDeLaSlide,
  imageDeLaForme,
  nomsDesFormes,
  formeNommee,
  nomsDesFormesCommencantPar,
  nombreDeSlides,
  paragraphesDeLaForme,
  partiesDeclarees,
  partiesDeclareesAbsentes,
  relationsCassees,
  taillesDePolice,
  texteDeLaForme,
  texteDeLaSlide,
  textesDeLaSlide,
} from '../aides/lecturePptx.js';
import { DonneesSupportCommissionHomologation } from '../../src/adaptateurs/adaptateurPowerpoint.interface.js';
import { PieceDuDossier } from '../../src/modeles/objetsPowerpoint/piecesDuDossier.js';
import { ContexteDuService } from '../../src/modeles/objetsPowerpoint/contexteDuService.js';
import { BesoinsDeSecurite } from '../../src/modeles/objetsPowerpoint/besoinsDeSecurite.js';
import { CartographiesDesRisques } from '../../src/modeles/objetsPowerpoint/cartographiesDesRisques.js';
import { IndiceCyberDuService } from '../../src/modeles/objetsPowerpoint/indiceCyber.js';
import { StatistiquesDesMesures } from '../../src/modeles/objetsPowerpoint/statistiquesDesMesures.js';
import { ExigenceRestante } from '../../src/modeles/objetsPowerpoint/exigencesRestantes.js';
import { AvisDUnMembre } from '../../src/modeles/objetsPowerpoint/avisDesMembres.js';
import { RisqueCartographie } from '../../src/modeles/objetsPowerpoint/risqueCartographie.js';
import { Gravite } from '../../src/moteurRisques/v2/graviteObjectifsVises.js';
import { Vraisemblance } from '../../src/moteurRisques/v2/vraisemblance/vraisemblance.types.js';
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

const pngDeLaJauge = (svg: string) => svgEnPng(svg, LARGEUR_DES_JAUGES);

const unePiece = (intitule: string): PieceDuDossier => ({
  intitule,
  source: 'MonServiceSécurisé',
  cochee: false,
});

describe("L'adaptateur PowerPoint utilisant pptx-automizer", () => {
  const POSITION_SLIDE_PIECES = 4;

  const adaptateur = new AdaptateurPowerpointAutomizer();

  const besoinsDeSecuriteParDefaut: BesoinsDeSecurite = {
    idNiveau: 'niveau1',
    niveau: 'Un niveau',
    resume: 'Un résumé',
    demarche: 'une démarche',
    niveauIndicatifAnssi: 'Un niveau indicatif',
    depasseRecommandation: true,
    nomService: 'Un service',
    exposition: {
      ouverture: 'Une ouverture',
      audience: 'Une audience',
      dureeDysfonctionnement: 'Une durée',
    },
    donneesIdentifiees: [],
  };

  const cartographiesParDefaut: CartographiesDesRisques = {
    bruts: [],
    aDate: [],
    cibles: [],
  };

  const indiceCyberParDefaut: IndiceCyberDuService = {
    nomService: 'Un service',
    total: 0,
    totalPersonnalise: 0,
    noteMax: 5,
    categories: [],
    referentiels: 'l’ANSSI',
  };

  const repartitionVide = {
    fait: 0,
    enCours: 0,
    nonFait: 0,
    aLancer: 0,
    aRemplir: 0,
  };

  const statistiquesDesMesuresParDefaut: StatistiquesDesMesures = {
    nombreDeMesuresGenerales: 0,
    nombreDeMesuresSpecifiques: 0,
    referentiels: 'l’ANSSI',
    parCriticite: {
      indispensables: { ...repartitionVide, restant: 0 },
      recommandees: { ...repartitionVide, restant: 0 },
    },
    parCategorie: [],
  };

  const contexteParDefaut: ContexteDuService = {
    organisation: 'Une organisation',
    statut: 'Un statut',
    urls: '',
    typeDeProjet: 'Un type de projet',
    hebergement: 'Un hébergement',
    donneesStockees: 'Une localisation',
    securisations: '',
  };

  const genereSupport = (
    donnees: Partial<DonneesSupportCommissionHomologation> = {}
  ) =>
    adaptateur.genereSupportCommissionHomologation({
      dateCreation: new Date(2026, 10, 9),
      piecesDuDossier: [unePiece('Une pièce du dossier')],
      contexte: contexteParDefaut,
      besoinsDeSecurite: besoinsDeSecuriteParDefaut,
      cartographiesDesRisques: cartographiesParDefaut,
      indiceCyber: indiceCyberParDefaut,
      statistiquesDesMesures: statistiquesDesMesuresParDefaut,
      exigencesRestantes: [],
      avisDesMembres: [],
      ...donnees,
    });

  describe('quand il génère le support de commission d’homologation', () => {
    it('contient tous les slides, dans le bon ordre', async () => {
      const pptx = await genereSupport();

      expect(await nombreDeSlides(pptx)).toBe(25);
      expect(textesDeLaSlide(await contenuSlide(pptx, 1))).toContain(
        'Support de commission d’homologation'
      );
      expect(textesDeLaSlide(await contenuSlide(pptx, 2))).toContain(
        'Sommaire'
      );
      expect(textesDeLaSlide(await contenuSlide(pptx, 3))).toContain(
        'Composition de la commission'
      );
      const pagePieces = await contenuSlide(pptx, 4);
      expect(textesDeLaSlide(pagePieces)).toContain(
        'Pièces du dossier transmises avant la séance'
      );
      expect(texteDeLaSlide(pagePieces)).not.toContain(
        'Composition de la commission et contenu du dossier'
      );
      const presentationDuSysteme = await contenuSlide(pptx, 5);
      expect(textesDeLaSlide(presentationDuSysteme)).toContain(
        '1. Présentation du système'
      );
      expect(textesDeLaSlide(presentationDuSysteme)).toContain('Logo');
      expect(textesDeLaSlide(await contenuSlide(pptx, 6))).toContain(
        'Contexte'
      );
      expect(textesDeLaSlide(await contenuSlide(pptx, 7))).toContain(
        'Périmètre de l’analyse : Vue fonctionnelle'
      );
      expect(textesDeLaSlide(await contenuSlide(pptx, 8))).toContain(
        'Périmètre de l’analyse : Description technique'
      );
      expect(textesDeLaSlide(await contenuSlide(pptx, 9))).toContain(
        'Objectifs de sécurité, impacts et exposition'
      );
      const intercalaireHistorique = await contenuSlide(pptx, 10);
      expect(textesDeLaSlide(intercalaireHistorique)).toContain(
        '2. Historique'
      );
      expect(textesDeLaSlide(intercalaireHistorique)).toContain('Logo');
      expect(textesDeLaSlide(await contenuSlide(pptx, 11))).toContain(
        'EVÈNEMENT'
      );
      expect(textesDeLaSlide(await contenuSlide(pptx, 12))).toContain(
        '3. Détail : Risques et plan d’action'
      );
      expect(textesDeLaSlide(await contenuSlide(pptx, 13))).toContain(
        'Cartographie des risques bruts'
      );
      expect(textesDeLaSlide(await contenuSlide(pptx, 17))).toContain(
        'Analyse de risques complémentaire (optionnel)'
      );
      const intercalaireSocle = await contenuSlide(pptx, 18);
      expect(textesDeLaSlide(intercalaireSocle)).toContain(
        '4. Détail : Socle et plan d’action'
      );
      expect(textesDeLaSlide(intercalaireSocle)).toContain('Logo');
      expect(textesDeLaSlide(await contenuSlide(pptx, 19))).toContain(
        'Conformité : Indice cyber'
      );
      expect(textesDeLaSlide(await contenuSlide(pptx, 20))).toContain(
        'Mesures de sécurité'
      );
      expect(textesDeLaSlide(await contenuSlide(pptx, 21))).toContain(
        'Exigences à mettre en place restantes'
      );
      const intercalaireAudit = await contenuSlide(pptx, 22);
      expect(textesDeLaSlide(intercalaireAudit)).toContain(
        '5. Détail : Audit et plan d’action'
      );
      expect(textesDeLaSlide(intercalaireAudit)).toContain('Logo');
      expect(textesDeLaSlide(await contenuSlide(pptx, 23))).toContain(
        'Résultat de l’audit : Nom de l’audit'
      );
      const intercalaireDecision = await contenuSlide(pptx, 24);
      expect(textesDeLaSlide(intercalaireDecision)).toContain(
        '6. Proposition de décision'
      );
      expect(textesDeLaSlide(intercalaireDecision)).toContain('Logo');
      expect(textesDeLaSlide(await contenuSlide(pptx, 25))).toContain(
        'Avis formalisés des membres'
      );
    });

    it("écrit le nom et la fonction de l'autorité d'homologation dans la composition de la commission", async () => {
      const pptx = await genereSupport({
        autorite: { nom: 'Jean Dupond', fonction: 'RSSI' },
      });

      expect(textesDeLaSlide(await contenuSlide(pptx, 3))).toContain(
        'Jean Dupond, RSSI'
      );
    });

    it("ne laisse pas l'autorité d'homologation à compléter quand elle est renseignée", async () => {
      const pptx = await genereSupport({
        autorite: { nom: 'Jean Dupond', fonction: 'RSSI' },
      });

      expect(
        nomsDesFormesCommencantPar(
          await contenuSlide(pptx, 3),
          'autorite-homologation-a-completer'
        )
      ).toEqual([]);
    });

    it("laisse l'autorité d'homologation à compléter par le projet quand elle n'est pas renseignée", async () => {
      const pptx = await genereSupport();

      const commission = await contenuSlide(pptx, 3);
      expect(nomsDesFormes(commission)).not.toContain('autorite-homologation');
      expect(nomsDesFormes(commission)).toContain(
        'autorite-homologation-a-completer-texte'
      );
    });

    describe('sur la page des pièces du dossier', () => {
      const nombreDePagesDePieces = async (pptx: Buffer) => {
        const positions = Array.from(
          { length: await nombreDeSlides(pptx) },
          (_, index) => index + 1
        );
        const slides = await Promise.all(
          positions.map((position) => contenuSlide(pptx, position))
        );
        return slides.filter((slide) =>
          nomsDesFormes(slide).includes('titre-page-pieces')
        ).length;
      };

      const titreDeLaPage = (page: string) =>
        texteDeLaForme(page, 'titre-page-pieces');

      const nomDeLaLigne = (numero: number, partie: string) =>
        `piece-${numero}-${partie}`;

      const texteDeLaLigne = (page: string, numero: number, partie: string) =>
        texteDeLaForme(page, nomDeLaLigne(numero, partie));

      it('écrit l’intitulé, la source et la case de chaque pièce', async () => {
        const pptx = await genereSupport({
          piecesDuDossier: [
            {
              intitule: 'Présent support de commission',
              source: 'MonServiceSécurisé',
              cochee: true,
            },
            {
              intitule: 'Charte informatique',
              source: 'Utilisateur',
              cochee: false,
            },
          ],
        });

        const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
        expect(texteDeLaLigne(page, 1, 'case')).toBe('☑');
        expect(texteDeLaLigne(page, 1, 'intitule')).toBe(
          'Présent support de commission'
        );
        expect(texteDeLaLigne(page, 1, 'source')).toBe('MonServiceSécurisé');
        expect(texteDeLaLigne(page, 2, 'case')).toBe('☐');
        expect(texteDeLaLigne(page, 2, 'intitule')).toBe('Charte informatique');
        expect(texteDeLaLigne(page, 2, 'source')).toBe('Utilisateur');
      });

      it('retire la version à compléter des lignes remplies', async () => {
        const pptx = await genereSupport({
          piecesDuDossier: [unePiece('Une pièce')],
        });

        const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
        expect(
          nomsDesFormesCommencantPar(page, 'piece-1-a-completer-')
        ).toEqual([]);
      });

      it('laisse les lignes au-delà des pièces à compléter par le projet', async () => {
        const pptx = await genereSupport({
          piecesDuDossier: [unePiece('Une pièce')],
        });

        const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
        expect(nomsDesFormes(page)).not.toContain('piece-2-intitule');
        expect(nomsDesFormes(page)).not.toContain('piece-2-source');
        expect(nomsDesFormes(page)).toContain(
          'piece-2-a-completer-intitule-texte'
        );
        expect(texteDeLaLigne(page, 2, 'case')).toBe('☐');
        expect(nomsDesFormes(page)).toContain(
          'piece-16-a-completer-reference-texte'
        );
      });

      it('répartit les pièces sur plusieurs pages numérotées au-delà de 16', async () => {
        const vingtPieces = Array.from({ length: 20 }, (_, index) =>
          unePiece(`Pièce ${index + 1}`)
        );
        const pptx = await genereSupport({ piecesDuDossier: vingtPieces });

        expect(await nombreDePagesDePieces(pptx)).toBe(2);
        expect(
          titreDeLaPage(await contenuSlide(pptx, POSITION_SLIDE_PIECES))
        ).toBe('Pièces du dossier transmises avant la séance 1/2');
        expect(
          titreDeLaPage(await contenuSlide(pptx, POSITION_SLIDE_PIECES + 1))
        ).toBe('Pièces du dossier transmises avant la séance 2/2');
      });

      it('commence la page suivante par les pièces restantes, puis la complète de lignes à remplir', async () => {
        const vingtPieces = Array.from({ length: 20 }, (_, index) =>
          unePiece(`Pièce ${index + 1}`)
        );
        const pptx = await genereSupport({ piecesDuDossier: vingtPieces });

        const deuxiemePage = await contenuSlide(
          pptx,
          POSITION_SLIDE_PIECES + 1
        );
        expect(texteDeLaLigne(deuxiemePage, 1, 'intitule')).toBe('Pièce 17');
        expect(texteDeLaLigne(deuxiemePage, 4, 'intitule')).toBe('Pièce 20');
        expect(nomsDesFormes(deuxiemePage)).toContain(
          'piece-5-a-completer-intitule-texte'
        );
      });

      it('ajoute une page entièrement à compléter quand les pièces remplissent exactement leurs pages', async () => {
        const seizePieces = Array.from({ length: 16 }, (_, index) =>
          unePiece(`Pièce ${index + 1}`)
        );
        const pptx = await genereSupport({ piecesDuDossier: seizePieces });

        expect(await nombreDePagesDePieces(pptx)).toBe(2);
        expect(
          titreDeLaPage(await contenuSlide(pptx, POSITION_SLIDE_PIECES))
        ).toBe('Pièces du dossier transmises avant la séance 1/2');
        const pageVide = await contenuSlide(pptx, POSITION_SLIDE_PIECES + 1);
        expect(titreDeLaPage(pageVide)).toBe(
          'Pièces du dossier transmises avant la séance 2/2'
        );
        expect(texteDeLaSlide(pageVide)).not.toContain(
          'Prérempli par MonServiceSécurisé'
        );
      });

      describe('pour une pièce dont l’intitulé peut être abrégé', () => {
        const PAS_D_UNE_LIGNE_DE_TEXTE = 257175;
        const pieceAbregeable = (intitule: string): PieceDuDossier => ({
          intitule,
          intituleAbrege: 'Avis écrits des collaborateurs',
          source: 'Utilisateur',
          cochee: false,
        });
        const ordonnee = (page: string, numero: number, partie: string) =>
          cadreDeLaForme(page, nomDeLaLigne(numero, partie)).y;

        it('agrandit sa ligne et descend les lignes suivantes de la colonne quand son intitulé tient sur deux lignes', async () => {
          const pptx = await genereSupport({
            piecesDuDossier: [
              unePiece('Pièce 1'),
              unePiece('Pièce 2'),
              pieceAbregeable(
                'Avis écrits de Jean Dupond, Marie Martin et Paul Durand'
              ),
              unePiece('Pièce 4'),
            ],
          });

          const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
          expect(
            ordonnee(page, 3, 'separateur') - ordonnee(page, 11, 'separateur')
          ).toBe(PAS_D_UNE_LIGNE_DE_TEXTE);
          expect(ordonnee(page, 4, 'case') - ordonnee(page, 12, 'case')).toBe(
            PAS_D_UNE_LIGNE_DE_TEXTE
          );
        });

        it('écrit son intitulé abrégé, sur une seule ligne, quand l’intitulé complet dépasserait trois lignes', async () => {
          const pptx = await genereSupport({
            piecesDuDossier: [
              pieceAbregeable(
                'Avis écrits de Jean Dupond, Marie Martin, Paul Durand, Sophie Bernard, Lucas Petit, Emma Moreau, Hugo Laurent, Léa Fournier, Nathan Girard et Chloé Garnier'
              ),
              unePiece('Pièce 2'),
            ],
          });

          const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
          expect(texteDeLaLigne(page, 1, 'intitule')).toBe(
            'Avis écrits des collaborateurs'
          );
          expect(ordonnee(page, 2, 'case')).toBe(ordonnee(page, 10, 'case'));
        });
      });

      it('utilise des lignes régulières sur toutes les pages', async () => {
        const vingtPieces = Array.from({ length: 20 }, (_, index) =>
          unePiece(`Pièce ${index + 1}`)
        );
        const pptx = await genereSupport({ piecesDuDossier: vingtPieces });

        const ordonneeDansLaPage = (page: string) => (numero: number) =>
          cadreDeLaForme(page, nomDeLaLigne(numero, 'case')).y;
        const pages = [
          await contenuSlide(pptx, POSITION_SLIDE_PIECES),
          await contenuSlide(pptx, POSITION_SLIDE_PIECES + 1),
        ];
        pages.forEach((page) => {
          const ordonnee = ordonneeDansLaPage(page);
          expect(ordonnee(4) - ordonnee(3)).toBe(ordonnee(12) - ordonnee(11));
        });
      });
    });

    describe('sur le contexte', () => {
      const POSITION_SLIDE_CONTEXTE = 6;

      const DESCRIPTION = 'contexte-description';

      const taillesDePoliceDeLaDescription = (slide: string) => [
        ...new Set(taillesDePolice(slide, DESCRIPTION)),
      ];

      const descriptionDe = (nombreDeMots: number) =>
        Array.from({ length: nombreDeMots }, () => 'description').join(' ');

      it('remplace le placeholder par la description du système d’information', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Un portail de démarches en ligne',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(texteDeLaSlide(contexte)).not.toContain('Portail RH permettant');
        expect(textesDeLaSlide(contexte)).toContain(
          'Un portail de démarches en ligne'
        );
      });

      it('réduit la police de la description à 16 pt quand elle dépasse deux lignes à 21 pt', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, description: descriptionDe(20) },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(taillesDePoliceDeLaDescription(contexte)).toEqual(['1600']);
      });

      it('réduit la police de la description à 14 pt quand elle dépasse trois lignes à 16 pt', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, description: descriptionDe(35) },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(taillesDePoliceDeLaDescription(contexte)).toEqual(['1400']);
      });

      it('compte chaque saut de ligne de la description comme une nouvelle ligne', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Premier paragraphe\n\nSecond paragraphe',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(taillesDePoliceDeLaDescription(contexte)).toEqual(['1600']);
      });

      it('coupe la description par « … » quand elle dépasse quatre lignes à 14 pt', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, description: descriptionDe(60) },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(texteDeLaForme(contexte, DESCRIPTION)).toBe(
          `${descriptionDe(40)}…`
        );
        expect(taillesDePoliceDeLaDescription(contexte)).toEqual(['1400']);
      });

      it('coupe aussi la description aux sauts de ligne quand elle dépasse quatre lignes à 14 pt', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Premier paragraphe\n\n\n\nDernier paragraphe',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(paragraphesDeLaForme(contexte, DESCRIPTION)).toContain(
          'Premier paragraphe…'
        );
        expect(texteDeLaForme(contexte, DESCRIPTION)).not.toContain(
          'Dernier paragraphe'
        );
      });

      it('écrit chaque ligne de la description dans son propre paragraphe', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Premier paragraphe\n\nSecond paragraphe',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(paragraphesDeLaForme(contexte, DESCRIPTION)).toEqual([
          'Premier paragraphe',
          '',
          'Second paragraphe',
        ]);
      });

      it('écrit l’organisation responsable', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            organisation: 'Commune de Saint-Ours (987 654 321 00020)',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(texteDeLaSlide(contexte)).not.toContain('Commune de Villeneuve');
        expect(textesDeLaSlide(contexte)).toContain(
          'Commune de Saint-Ours (987 654 321 00020)'
        );
      });

      it('écrit le statut de déploiement', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, statut: 'En conception' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(texteDeLaSlide(contexte)).not.toContain('En production');
        expect(textesDeLaSlide(contexte)).toContain('En conception');
      });

      it('écrit les URL du projet', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, urls: 'https://rh.exemple.fr' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(texteDeLaSlide(contexte)).not.toContain(
          'https://rh.villeneuve.fr'
        );
        expect(textesDeLaSlide(contexte)).toContain('https://rh.exemple.fr');
      });

      it('écrit le type de projet', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            typeDeProjet: 'Application mobile',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(texteDeLaSlide(contexte)).not.toContain(
          'Service en ligne, Portail'
        );
        expect(textesDeLaSlide(contexte)).toContain('Application mobile');
      });

      it('écrit l’hébergement', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, hebergement: 'Autre' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(texteDeLaSlide(contexte)).not.toContain(
          'Le système est entièrement fourni'
        );
        expect(textesDeLaSlide(contexte)).toContain('Autre');
      });

      it('écrit la localisation des données stockées', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            donneesStockees:
              "En partie ou totalement hors de l'Union européenne",
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(texteDeLaSlide(contexte)).not.toContain(
          'Au sein de l’Union européenne'
        );
        expect(textesDeLaSlide(contexte)).toContain(
          "En partie ou totalement hors de l'Union européenne"
        );
      });

      it('écrit les sécurisations prévues', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, securisations: 'Un annuaire' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(texteDeLaSlide(contexte)).not.toContain('Des postes de travail');
        expect(textesDeLaSlide(contexte)).toContain('Un annuaire');
      });
    });

    describe('sur les objectifs de sécurité', () => {
      const POSITION_SLIDE_BESOINS_DE_SECURITE = 9;
      const BAS_DE_L_ENCART_ANSSI = 6295579 + 1828577;
      const DESCENTE_SANS_ENCART = BAS_DE_L_ENCART_ANSSI - (5251772 + 929506);

      it('écrit le niveau de besoin de sécurité', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            niveau: 'Modérés',
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'besoins-niveau')).toBe('Modérés');
      });

      it('illustre le niveau avec l’illustration de MonServiceSécurisé', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            idNiveau: 'niveau2',
          },
        });

        const illustration = await imageDeLaForme(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE,
          'besoins-illustration'
        );
        expect(
          illustration.equals(
            await readFile(
              'src/vuesPowerpoint/illustrationsNiveaux/niveau2.png'
            )
          )
        ).toBe(true);
      });

      it('écrit le résumé du niveau', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            resume: 'Les besoins de sécurité sont modérés.',
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'besoins-resume')).toBe(
          'Les besoins de sécurité sont modérés.'
        );
      });

      it('écrit la démarche indicative adaptée, en majuscules', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            demarche: 'intermédiaire',
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'besoins-demarche')).toBe(
          'DÉMARCHE INDICATIVE ADAPTÉE : INTERMÉDIAIRE'
        );
      });

      it('écrit le nom du service et le niveau dans l’explication par le projet', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            nomService: 'Portail des démarches',
            niveau: 'Modérés',
          },
        });

        const explication = texteDeLaForme(
          await contenuSlide(pptx, POSITION_SLIDE_BESOINS_DE_SECURITE),
          'besoins-explication'
        );
        expect(explication).toContain(
          'Dans le cadre du projet Portail des démarches, le système'
        );
        expect(explication).toContain(
          'MonServiceSécurisé, soit Modérés, apparaît'
        );
      });

      it('écrit l’exposition du service', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            exposition: {
              ouverture: 'Accessible depuis internet',
              audience: 'Large : Utilisé à l’échelle nationale.',
              dureeDysfonctionnement: 'Moins de 4h',
            },
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'exposition-ouverture')).toBe(
          'Accessible depuis internet'
        );
        expect(texteDeLaForme(besoins, 'exposition-audience')).toBe(
          'Large : Utilisé à l’échelle nationale.'
        );
        expect(texteDeLaForme(besoins, 'exposition-duree')).toBe('Moins de 4h');
      });

      it('agrandit l’ouverture et descend l’audience et la durée d’une ligne quand l’ouverture dépasse une ligne', async () => {
        const avecOuverture = async (ouverture: string) =>
          contenuSlide(
            await genereSupport({
              besoinsDeSecurite: {
                ...besoinsDeSecuriteParDefaut,
                exposition: {
                  ...besoinsDeSecuriteParDefaut.exposition,
                  ouverture,
                },
              },
            }),
            POSITION_SLIDE_BESOINS_DE_SECURITE
          );
        const courte = await avecOuverture(
          'Interne et ouvert à certains tiers'
        );
        const longue = await avecOuverture(
          "Accessible à très peu de personnes en interne de l'organisation"
        );

        const HAUTEUR_D_UNE_LIGNE = 308595;
        expect(cadreDeLaForme(longue, 'exposition-ouverture').hauteur).toBe(
          cadreDeLaForme(courte, 'exposition-ouverture').hauteur +
            HAUTEUR_D_UNE_LIGNE
        );
        [
          'exposition-audience-libelle',
          'exposition-audience',
          'exposition-duree-libelle',
          'exposition-duree',
        ].forEach((forme) =>
          expect(cadreDeLaForme(longue, forme).y).toBe(
            cadreDeLaForme(courte, forme).y + HAUTEUR_D_UNE_LIGNE
          )
        );
      });

      it('écrit une pastille par donnée identifiée, à la place de la pastille modèle', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            donneesIdentifiees: [
              'Documents RH sensibles',
              'Plannings des agents',
            ],
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'donnee-identifiee-1')).toBe(
          'Documents RH sensibles'
        );
        expect(texteDeLaForme(besoins, 'donnee-identifiee-2')).toBe(
          'Plannings des agents'
        );
        expect(nomsDesFormes(besoins)).not.toContain('donnee-identifiee-3');
        expect(nomsDesFormes(besoins)).not.toContain('donnee-identifiee');
      });

      describe('pour les pastilles des données identifiées', () => {
        const ECART_ENTRE_PASTILLES = 114300;

        const BAS_DE_LA_ZONE_DES_PASTILLES = 6030739 + 3303761 - 228600;

        const slideAvecLesDonnees = async (donneesIdentifiees: string[]) =>
          contenuSlide(
            await genereSupport({
              besoinsDeSecurite: {
                ...besoinsDeSecuriteParDefaut,
                donneesIdentifiees,
              },
            }),
            POSITION_SLIDE_BESOINS_DE_SECURITE
          );

        const nomsDesPastilles = (besoins: string) =>
          nomsDesFormes(besoins).filter((nom) =>
            /^donnee-identifiee-\d+$/.test(nom)
          );

        const pastillesDe = async (donneesIdentifiees: string[]) => {
          const besoins = await slideAvecLesDonnees(donneesIdentifiees);
          return nomsDesPastilles(besoins).map((nom) =>
            cadreDeLaForme(besoins, nom)
          );
        };

        const taillesDePoliceDesPastilles = (besoins: string) => [
          ...new Set(
            nomsDesPastilles(besoins).flatMap((nom) =>
              taillesDePolice(besoins, nom)
            )
          ),
        ];

        const basDesPastilles = (pastilles: { y: number; hauteur: number }[]) =>
          Math.max(...pastilles.map(({ y, hauteur }) => y + hauteur));

        const cinqDonnees = [
          'Données d’identité',
          'Documents RH sensibles',
          'Données relatives à la situation familiale, économique et financière',
          'Données techniques',
          'Plannings des agents',
        ];

        it('gardent la police de 18 pt quand elles tiennent dans la carte', async () => {
          const besoins = await slideAvecLesDonnees(['Données techniques']);

          expect(taillesDePoliceDesPastilles(besoins)).toEqual(['1800']);
        });

        it('réduisent leur police pour tenir dans la carte quand elles débordent en 18 pt', async () => {
          const besoins = await slideAvecLesDonnees([
            'Données techniques',
            'Documents RH sensibles',
            'Données d’identité',
            'Plannings des agents',
            'Données sensibles',
          ]);
          const pastilles = nomsDesPastilles(besoins).map((nom) =>
            cadreDeLaForme(besoins, nom)
          );

          const [taille] = taillesDePoliceDesPastilles(besoins);
          expect(taillesDePoliceDesPastilles(besoins)).toHaveLength(1);
          expect(Number(taille)).toBeLessThan(1800);
          expect(basDesPastilles(pastilles)).toBeLessThanOrEqual(
            BAS_DE_LA_ZONE_DES_PASTILLES
          );
        });

        it('remplacent les dernières par « et N autres » quand elles débordent même en 14 pt', async () => {
          const besoins = await slideAvecLesDonnees([
            ...cinqDonnees,
            'Agendas des élus',
            'Comptes rendus de réunion',
          ]);
          const noms = nomsDesPastilles(besoins);
          const pastilles = noms.map((nom) => cadreDeLaForme(besoins, nom));

          expect(texteDeLaForme(besoins, noms[noms.length - 1])).toBe(
            `et ${7 - (noms.length - 1)} autres`
          );
          expect(noms.length).toBeLessThan(7);
          expect(basDesPastilles(pastilles)).toBeLessThanOrEqual(
            BAS_DE_LA_ZONE_DES_PASTILLES
          );
        });

        it('écrit « et 1 autre » au singulier', async () => {
          const besoins = await slideAvecLesDonnees(cinqDonnees);
          const noms = nomsDesPastilles(besoins);

          expect(noms).toHaveLength(5);
          expect(texteDeLaForme(besoins, noms[4])).toBe('et 1 autre');
        });

        it('les place côte à côte tant qu’elles tiennent sur la ligne', async () => {
          const [premiere, seconde] = await pastillesDe([
            'Données techniques',
            'Agendas',
          ]);

          expect(seconde.y).toBe(premiere.y);
          expect(seconde.x).toBe(
            premiere.x + premiere.largeur + ECART_ENTRE_PASTILLES
          );
        });

        it('adaptent leur largeur à leur texte', async () => {
          const [courte] = await pastillesDe(['Données techniques']);
          const [longue] = await pastillesDe([
            'Données administratives et financières',
          ]);

          expect(longue.largeur).toBeGreaterThan(courte.largeur);
        });

        it('sont assez larges pour que leur texte tienne sur une ligne, au gras italique de 18 pt', async () => {
          const LARGEUR_DE_DOCUMENTS_RH_SENSIBLES_AU_RENDU = 3048819;
          const [pastille] = await pastillesDe(['Documents RH sensibles']);

          expect(pastille.largeur).toBeGreaterThanOrEqual(
            LARGEUR_DE_DOCUMENTS_RH_SENSIBLES_AU_RENDU
          );
        });

        it('passent à la ligne quand la pastille ne tient plus sur la ligne', async () => {
          const [premiere, , troisieme] = await pastillesDe([
            'Données techniques',
            'Agendas',
            'Documents RH sensibles',
          ]);

          expect(troisieme.x).toBe(premiere.x);
          expect(troisieme.y).toBe(
            premiere.y + premiere.hauteur + ECART_ENTRE_PASTILLES
          );
        });

        it('prennent toute la largeur et passent sur deux lignes quand leur texte dépasse une ligne', async () => {
          const [courte] = await pastillesDe(['Données techniques']);
          const [longue, suivante] = await pastillesDe([
            'Données relatives à la situation familiale, économique et financière',
            'Données techniques',
          ]);

          expect(longue.largeur).toBe(4381500);
          expect(longue.hauteur).toBe(784771);
          expect(suivante.y).toBe(
            longue.y + longue.hauteur + ECART_ENTRE_PASTILLES
          );
          expect(courte.hauteur).toBe(487635);
        });
      });

      it('nomme, dans l’encart, le niveau identifié à titre indicatif par l’ANSSI', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            niveauIndicatifAnssi: 'Basiques',
            depasseRecommandation: true,
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'besoins-anssi-titre')).toBe(
          'Ce niveau est supérieur à celui identifié à titre indicatif par l’ANSSI (Basiques).'
        );
      });

      it('retire l’encart quand le niveau choisi n’est pas supérieur à celui identifié par l’ANSSI', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            depasseRecommandation: false,
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(nomsDesFormesCommencantPar(besoins, 'besoins-anssi-')).toEqual(
          []
        );
      });

      it('descend le niveau et son résumé à la place de l’encart quand le niveau choisi est celui recommandé', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            depasseRecommandation: false,
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        const resume = cadreDeLaForme(besoins, 'besoins-resume');
        expect(resume.y + resume.hauteur).toBe(BAS_DE_L_ENCART_ANSSI);
        expect(cadreDeLaForme(besoins, 'besoins-niveau').y).toBe(
          4661222 + DESCENTE_SANS_ENCART
        );
      });

      it('agrandit l’illustration jusqu’au niveau, en gardant ses proportions et son axe, quand le niveau choisi est celui recommandé', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            depasseRecommandation: false,
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
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
      const POSITION_CARTOGRAPHIE_DES_RISQUES_BRUTS = 13;

      const unRisque = (
        identifiant: string,
        gravite: Gravite,
        vraisemblance: Vraisemblance
      ): RisqueCartographie => ({
        identifiant,
        intitule: `Intitulé de ${identifiant}`,
        description: `Description de ${identifiant}`,
        gravite,
        vraisemblance,
        niveau: 'moyen',
      });

      it('écrit dans chaque case de la matrice les identifiants de ses risques', async () => {
        const pptx = await genereSupport({
          cartographiesDesRisques: {
            ...cartographiesParDefaut,
            bruts: [
              unRisque('R3', 4, 4),
              unRisque('R7', 4, 4),
              unRisque('RS1', 2, 1),
            ],
          },
        });

        const cartographie = await contenuSlide(
          pptx,
          POSITION_CARTOGRAPHIE_DES_RISQUES_BRUTS
        );
        expect(texteDeLaForme(cartographie, 'matrice-g4-v4')).toBe('R3, R7');
        expect(texteDeLaForme(cartographie, 'matrice-g2-v1')).toBe('RS1');
        expect(texteDeLaForme(cartographie, 'matrice-g1-v1')).toBe('');
        expect(texteDeLaSlide(cartographie)).not.toContain(
          'R3, R7, R9, R11, R14'
        );
        expect(textesDeLaSlide(cartographie)).not.toContain('R1, R5');
      });

      it('écrit le nombre de risques en tête de la liste', async () => {
        const pptx = await genereSupport({
          cartographiesDesRisques: {
            ...cartographiesParDefaut,
            bruts: [unRisque('R1', 3, 4), unRisque('RS1', 2, 1)],
          },
        });

        const cartographie = await contenuSlide(
          pptx,
          POSITION_CARTOGRAPHIE_DES_RISQUES_BRUTS
        );
        expect(texteDeLaForme(cartographie, 'liste-risques-total')).toBe(
          '2 RISQUES'
        );
      });

      it('écrit l’identifiant et l’intitulé de chaque risque, et retire les lignes inutilisées', async () => {
        const pptx = await genereSupport({
          cartographiesDesRisques: {
            ...cartographiesParDefaut,
            bruts: [unRisque('R1', 3, 4), unRisque('RS1', 2, 1)],
          },
        });

        const cartographie = await contenuSlide(
          pptx,
          POSITION_CARTOGRAPHIE_DES_RISQUES_BRUTS
        );
        expect(texteDeLaForme(cartographie, 'risque-1-identifiant')).toBe('R1');
        expect(texteDeLaForme(cartographie, 'risque-1-intitule')).toBe(
          'Intitulé de R1'
        );
        expect(texteDeLaForme(cartographie, 'risque-2-identifiant')).toBe(
          'RS1'
        );
        expect(texteDeLaForme(cartographie, 'risque-2-intitule')).toBe(
          'Intitulé de RS1'
        );
        expect(nomsDesFormesCommencantPar(cartographie, 'risque-3-')).toEqual(
          []
        );
        expect(texteDeLaSlide(cartographie)).not.toContain(
          'Compromission d’un poste de travail'
        );
      });

      it('colore la pastille de chaque risque selon son niveau, comme les cases de la matrice', async () => {
        const pptx = await genereSupport({
          cartographiesDesRisques: {
            ...cartographiesParDefaut,
            bruts: [
              { ...unRisque('R1', 1, 1), niveau: 'faible' },
              { ...unRisque('R2', 4, 1), niveau: 'moyen' },
              { ...unRisque('R3', 4, 4), niveau: 'eleve' },
            ],
          },
        });

        const cartographie = await contenuSlide(
          pptx,
          POSITION_CARTOGRAPHIE_DES_RISQUES_BRUTS
        );
        expect(couleurDuFond(cartographie, 'risque-1-pastille')).toBe('84C14E');
        expect(couleurDuFond(cartographie, 'risque-2-pastille')).toBe('FAC63C');
        expect(couleurDuFond(cartographie, 'risque-3-pastille')).toBe('F8785B');
      });

      it('colore en gris la pastille d’un risque non évalué', async () => {
        const pptx = await genereSupport({
          cartographiesDesRisques: {
            ...cartographiesParDefaut,
            bruts: [{ ...unRisque('RS1', 4, 4), niveau: 'nonEvalue' }],
          },
        });

        const cartographie = await contenuSlide(
          pptx,
          POSITION_CARTOGRAPHIE_DES_RISQUES_BRUTS
        );
        expect(couleurDuFond(cartographie, 'risque-1-pastille')).toBe('EEEEEE');
      });

      describe('pour les lignes de la liste des risques', () => {
        const HAUTEUR_D_UNE_LIGNE_DE_TEXTE_EN_18_PT = 274320;
        const MARGES_D_UNE_LIGNE = 76200 + 50800;
        const ECART_ENTRE_LIGNES = 38100;

        const intituleDe = (nombreDeLignes: number) =>
          Array.from(
            { length: nombreDeLignes },
            () => 'Compromission d’un poste de travail utilisateur'
          ).join(' ');

        const listeAvecLesIntitules = async (intitules: string[]) =>
          contenuSlide(
            await genereSupport({
              cartographiesDesRisques: {
                ...cartographiesParDefaut,
                bruts: intitules.map((intitule, index) => ({
                  ...unRisque(`R${index + 1}`, 4, 4),
                  intitule,
                })),
              },
            }),
            POSITION_CARTOGRAPHIE_DES_RISQUES_BRUTS
          );

        it('ajustent leur hauteur au nombre de lignes de leur intitulé, en 18 pt', async () => {
          const cartographie = await listeAvecLesIntitules([
            intituleDe(1),
            intituleDe(2),
            intituleDe(3),
            intituleDe(4),
          ]);

          const hauteur = (numero: number) =>
            cadreDeLaForme(cartographie, `risque-${numero}-fond`).hauteur;
          [1, 2, 3, 4].forEach((lignes) =>
            expect(hauteur(lignes)).toBe(
              MARGES_D_UNE_LIGNE +
                lignes * HAUTEUR_D_UNE_LIGNE_DE_TEXTE_EN_18_PT
            )
          );
        });

        it('s’empilent sous l’en-tête, séparées par l’écart de la maquette', async () => {
          const cartographie = await listeAvecLesIntitules([
            intituleDe(3),
            intituleDe(1),
            intituleDe(2),
          ]);

          const fond = (numero: number) =>
            cadreDeLaForme(cartographie, `risque-${numero}-fond`);
          expect(fond(1).y).toBe(3190949);
          [2, 3].forEach((numero) =>
            expect(fond(numero).y).toBe(
              fond(numero - 1).y + fond(numero - 1).hauteur + ECART_ENTRE_LIGNES
            )
          );
        });

        it('centrent la pastille et l’identifiant dans la ligne, et ajustent la zone de l’intitulé', async () => {
          const cartographie = await listeAvecLesIntitules([
            intituleDe(1),
            intituleDe(3),
          ]);

          const cadre = (nom: string) => cadreDeLaForme(cartographie, nom);
          const fond = cadre('risque-2-fond');
          const pastille = cadre('risque-2-pastille');
          expect(pastille.y).toBe(
            fond.y + Math.floor((fond.hauteur - pastille.hauteur) / 2)
          );
          expect(cadre('risque-2-identifiant').y).toBe(pastille.y + 19050);
          const intitule = cadre('risque-2-intitule');
          expect(intitule.y).toBe(fond.y + 57150);
          expect(intitule.hauteur).toBe(fond.hauteur - 76200);
        });
      });

      describe('quand les risques ne tiennent pas sur une page', () => {
        const pagesDeLaCartographie = async (pptx: Buffer) => {
          const positions = Array.from(
            { length: await nombreDeSlides(pptx) },
            (_, index) => index + 1
          );
          const slides = await Promise.all(
            positions.map((position) => contenuSlide(pptx, position))
          );
          return slides.filter(
            (slide) =>
              nomsDesFormes(slide).includes('liste-risques-total') &&
              texteDeLaForme(slide, 'cartographie-titre').startsWith(
                'Cartographie des risques bruts'
              )
          );
        };

        const identifiantsDeLaPage = (page: string) =>
          nomsDesFormes(page)
            .filter((nom) => /^risque-\d+-identifiant$/.test(nom))
            .map((nom) => texteDeLaForme(page, nom));

        const intituleDeTroisLignes = Array.from(
          { length: 3 },
          () => 'Compromission d’un poste de travail utilisateur'
        ).join(' ');

        it('répartit les risques sur plusieurs pages, selon la hauteur de leurs lignes', async () => {
          const huitRisques = Array.from({ length: 8 }, (_, index) => ({
            ...unRisque(`R${index + 1}`, 4, 4),
            intitule: intituleDeTroisLignes,
          }));
          const pptx = await genereSupport({
            cartographiesDesRisques: {
              ...cartographiesParDefaut,
              bruts: huitRisques,
            },
          });

          const pages = await pagesDeLaCartographie(pptx);
          expect(pages).toHaveLength(2);
          expect(identifiantsDeLaPage(pages[0])).toEqual([
            'R1',
            'R2',
            'R3',
            'R4',
            'R5',
            'R6',
          ]);
          expect(identifiantsDeLaPage(pages[1])).toEqual(['R7', 'R8']);
        });

        it('ne met pas plus de 7 risques par page, le nombre de lignes du modèle', async () => {
          const neufRisquesCourts = Array.from({ length: 9 }, (_, index) =>
            unRisque(`R${index + 1}`, 4, 4)
          );
          const pptx = await genereSupport({
            cartographiesDesRisques: {
              ...cartographiesParDefaut,
              bruts: neufRisquesCourts,
            },
          });

          const pages = await pagesDeLaCartographie(pptx);
          expect(pages.map(identifiantsDeLaPage)).toEqual([
            ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'],
            ['R8', 'R9'],
          ]);
        });

        it('numérote les pages dans le titre', async () => {
          const neufRisquesCourts = Array.from({ length: 9 }, (_, index) =>
            unRisque(`R${index + 1}`, 4, 4)
          );
          const pptx = await genereSupport({
            cartographiesDesRisques: {
              ...cartographiesParDefaut,
              bruts: neufRisquesCourts,
            },
          });

          const pages = await pagesDeLaCartographie(pptx);
          expect(
            pages.map((page) => texteDeLaForme(page, 'cartographie-titre'))
          ).toEqual([
            'Cartographie des risques bruts 1/2',
            'Cartographie des risques bruts 2/2',
          ]);
        });

        it('ne numérote pas le titre quand les risques tiennent sur une page', async () => {
          const pptx = await genereSupport({
            cartographiesDesRisques: {
              ...cartographiesParDefaut,
              bruts: [unRisque('R1', 4, 4)],
            },
          });

          const [page] = await pagesDeLaCartographie(pptx);
          expect(texteDeLaForme(page, 'cartographie-titre')).toBe(
            'Cartographie des risques bruts'
          );
        });
      });

      it('garde la police de 18 pt dans une case qui contient peu de risques', async () => {
        const pptx = await genereSupport({
          cartographiesDesRisques: {
            ...cartographiesParDefaut,
            bruts: [unRisque('R3', 4, 4), unRisque('R7', 4, 4)],
          },
        });

        const cartographie = await contenuSlide(
          pptx,
          POSITION_CARTOGRAPHIE_DES_RISQUES_BRUTS
        );
        expect(taillesDePolice(cartographie, 'matrice-g4-v4')).toEqual([
          '1800',
        ]);
      });

      it('réduit la police d’une case dont les identifiants dépassent trois lignes en 18 pt', async () => {
        const identifiants = [
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
        const pptx = await genereSupport({
          cartographiesDesRisques: {
            ...cartographiesParDefaut,
            bruts: identifiants.map((identifiant) =>
              unRisque(identifiant, 4, 4)
            ),
          },
        });

        const cartographie = await contenuSlide(
          pptx,
          POSITION_CARTOGRAPHIE_DES_RISQUES_BRUTS
        );
        expect(taillesDePolice(cartographie, 'matrice-g4-v4')).toEqual([
          '1400',
        ]);
      });
    });

    describe('sur les cartographies à date et résiduelle cible', () => {
      const unRisque = (identifiant: string): RisqueCartographie => ({
        identifiant,
        intitule: `Intitulé de ${identifiant}`,
        description: `Description de ${identifiant}`,
        gravite: 4,
        vraisemblance: 4,
        niveau: 'eleve',
      });

      it('suivent la cartographie brute et la description des risques, chacune avec son titre et ses risques', async () => {
        const pptx = await genereSupport({
          cartographiesDesRisques: {
            bruts: [unRisque('R1')],
            aDate: [unRisque('R2')],
            cibles: [unRisque('R3')],
          },
        });

        const titreEtRisque = async (position: number) => {
          const slide = await contenuSlide(pptx, position);
          return [
            texteDeLaForme(slide, 'cartographie-titre'),
            texteDeLaForme(slide, 'risque-1-identifiant'),
          ];
        };
        expect(await titreEtRisque(13)).toEqual([
          'Cartographie des risques bruts',
          'R1',
        ]);
        expect(await titreEtRisque(15)).toEqual([
          'Cartographie des risques à date',
          'R2',
        ]);
        expect(await titreEtRisque(16)).toEqual([
          'Cartographie des risques résiduels cible',
          'R3',
        ]);
      });
    });

    describe('sur l’analyse de risques complémentaire', () => {
      const POSITION_ANALYSE_DE_RISQUES_COMPLEMENTAIRE = 17;

      it('ne la présente pas comme optionnelle pour un service qui n’est pas en niveau basique', async () => {
        const slide = await contenuSlide(
          await genereSupport({
            besoinsDeSecurite: {
              ...besoinsDeSecuriteParDefaut,
              idNiveau: 'niveau2',
            },
          }),
          POSITION_ANALYSE_DE_RISQUES_COMPLEMENTAIRE
        );

        expect(textesDeLaSlide(slide)).toContain(
          'Analyse de risques complémentaire'
        );
      });

      it('la présente comme optionnelle pour un service en niveau basique', async () => {
        const slide = await contenuSlide(
          await genereSupport({
            besoinsDeSecurite: {
              ...besoinsDeSecuriteParDefaut,
              idNiveau: 'niveau1',
            },
          }),
          POSITION_ANALYSE_DE_RISQUES_COMPLEMENTAIRE
        );

        expect(textesDeLaSlide(slide)).toContain(
          'Analyse de risques complémentaire (optionnel)'
        );
      });
    });

    describe('sur l’indice cyber', () => {
      const POSITION_INDICE_CYBER = 19;
      const ESPACE_DE_NOMS_SVG =
        'http://schemas.microsoft.com/office/drawing/2016/SVG/main';

      it('écrit le nom du service et ses deux indices, arrondis au dixième', async () => {
        const pptx = await genereSupport({
          indiceCyber: {
            ...indiceCyberParDefaut,
            nomService: 'Mon service',
            total: 2.43,
            totalPersonnalise: 2.6,
          },
        });

        const slide = await contenuSlide(pptx, POSITION_INDICE_CYBER);

        expect(texteDeLaForme(slide, 'indice-cyber-texte')).toBe(
          'Le socle de sécurité a été réalisé via l’outil MonServiceSécurisé. L’indice cyber ANSSI de Mon service calculé est de 2,4/5, et l’indice cyber personnalisé est de 2,6/5.'
        );
      });

      it("dessine la jauge de l'indice cyber ANSSI", async () => {
        const pptx = await genereSupport({
          indiceCyber: { ...indiceCyberParDefaut, total: 2.43, noteMax: 5 },
        });

        const jauge = await imageDeLaForme(
          pptx,
          POSITION_INDICE_CYBER,
          'indice-cyber-jauge'
        );

        expect(jauge.equals(pngDeLaJauge(svgIndiceCyber(2.43, 5)))).toBe(true);
      });

      it("dessine la jauge de l'indice cyber personnalisé", async () => {
        const pptx = await genereSupport({
          indiceCyber: {
            ...indiceCyberParDefaut,
            totalPersonnalise: 2.6,
            noteMax: 5,
          },
        });

        const jauge = await imageDeLaForme(
          pptx,
          POSITION_INDICE_CYBER,
          'indice-cyber-jauge-personnalisee'
        );

        expect(
          jauge.equals(pngDeLaJauge(svgIndiceCyberPersonnalise(2.6, 5)))
        ).toBe(true);
      });

      it("dessine le radar de l'indice cyber par catégorie", async () => {
        const categories = [
          { libelle: 'Gouvernance', note: 3.2 },
          { libelle: 'Protection', note: 1.8 },
        ];
        const pptx = await genereSupport({
          indiceCyber: { ...indiceCyberParDefaut, categories, noteMax: 5 },
        });

        const radar = await imageDeLaForme(
          pptx,
          POSITION_INDICE_CYBER,
          'indice-cyber-radar'
        );

        expect(
          radar.equals(
            svgEnPng(svgRadarIndiceCyber(categories, 5), LARGEUR_DU_RADAR)
          )
        ).toBe(true);
      });

      it("n'affiche pas la variante SVG figée du modèle à la place des jauges", async () => {
        const pptx = await genereSupport();

        const slide = await contenuSlide(pptx, POSITION_INDICE_CYBER);

        expect(elementsDeLaSlide(slide, ESPACE_DE_NOMS_SVG, 'svgBlip')).toEqual(
          []
        );
      });

      it('nomme les référentiels des mesures sur lesquelles l’indice est calculé', async () => {
        const pptx = await genereSupport({
          indiceCyber: {
            ...indiceCyberParDefaut,
            referentiels: 'l’ANSSI et la CNIL',
          },
        });

        const slide = await contenuSlide(pptx, POSITION_INDICE_CYBER);

        expect(texteDeLaForme(slide, 'indice-cyber-referentiels')).toBe(
          'Calculé sur les mesures proposées par l’ANSSI et la CNIL'
        );
        expect(texteDeLaForme(slide, 'indice-cyber-explication')).toBe(
          'L’indice cyber est calculé sur la base des informations renseignées par l’équipe concernant les mesures de sécurité proposées par l’ANSSI et la CNIL, et à l’exclusion des mesures spécifiques ajoutées. Il fournit une évaluation indicative du niveau de sécurisation du service.'
        );
      });
    });

    describe('sur les statistiques des mesures', () => {
      const POSITION_STATISTIQUES_DES_MESURES = 20;

      const enTete = async (statistiques: Partial<StatistiquesDesMesures>) =>
        texteDeLaForme(
          await contenuSlide(
            await genereSupport({
              statistiquesDesMesures: {
                ...statistiquesDesMesuresParDefaut,
                ...statistiques,
              },
            }),
            POSITION_STATISTIQUES_DES_MESURES
          ),
          'mesures-total'
        );

      it('écrit le nombre de mesures proposées par les référentiels et ajoutées par l’équipe', async () => {
        expect(
          await enTete({
            nombreDeMesuresGenerales: 113,
            nombreDeMesuresSpecifiques: 4,
            referentiels: 'l’ANSSI et la CNIL',
          })
        ).toBe(
          'Total : 113 mesures proposées par l’ANSSI et la CNIL + 4 ajoutées par l’équipe.'
        );
      });

      it('accorde au singulier une seule mesure proposée ou ajoutée', async () => {
        expect(
          await enTete({
            nombreDeMesuresGenerales: 1,
            nombreDeMesuresSpecifiques: 1,
            referentiels: 'l’ANSSI',
          })
        ).toBe(
          'Total : 1 mesure proposée par l’ANSSI + 1 ajoutée par l’équipe.'
        );
      });

      it('légende les statuts avec les couleurs de MonServiceSécurisé', async () => {
        const slide = await contenuSlide(
          await genereSupport(),
          POSITION_STATISTIQUES_DES_MESURES
        );

        const couleur = (nom: string) =>
          formeNommee(slide, nom)
            .getElementsByTagName('a:srgbClr')[0]
            .getAttribute('val');
        expect(
          ['fait', 'enCours', 'nonFait', 'aLancer', 'aDefinir'].map(
            (statut) => [
              couleur(`legende-${statut}-texte`),
              couleur(`legende-${statut}-fond`),
            ]
          )
        ).toEqual([
          ['0C8626', 'D4F4DB'],
          ['0079D0', 'DBEEFF'],
          ['FAA72C', 'FFF2DE'],
          ['7025DA', 'E9DDFF'],
          ['667892', 'F1F5F9'],
        ]);
      });

      it('borde la légende « Statut à définir » de gris pour la détacher du fond de la slide', async () => {
        const slide = await contenuSlide(
          await genereSupport(),
          POSITION_STATISTIQUES_DES_MESURES
        );

        const bordure = formeNommee(slide, 'legende-aDefinir-fond')
          .getElementsByTagName('a:ln')[0]
          .getElementsByTagName('a:srgbClr')[0];
        expect(bordure?.getAttribute('val')).toBe('94A3B8');
      });

      describe('par catégorie', () => {
        const uneCategorie = (
          libelle: string,
          repartition: Partial<typeof repartitionVide>
        ) => {
          const complete = { ...repartitionVide, ...repartition };
          return {
            libelle,
            ...complete,
            total: Object.values(complete).reduce((somme, n) => somme + n, 0),
          };
        };

        const slideAvecLesCategories = async (
          parCategorie: StatistiquesDesMesures['parCategorie']
        ) =>
          contenuSlide(
            await genereSupport({
              statistiquesDesMesures: {
                ...statistiquesDesMesuresParDefaut,
                parCategorie,
              },
            }),
            POSITION_STATISTIQUES_DES_MESURES
          );

        const quatreCategories = [
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
          }),
        ];

        it('écrit le libellé et le nombre de mesures de chaque catégorie', async () => {
          const slide = await slideAvecLesCategories(quatreCategories);

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

        it('découpe la barre de chaque catégorie en segments proportionnels, sans les statuts vides', async () => {
          const slide = await slideAvecLesCategories(quatreCategories);

          const barre = cadreDeLaForme(slide, 'categorie-2-barre');
          const segments = ['fait', 'enCours', 'nonFait'].map((statut) =>
            cadreDeLaForme(slide, `categorie-2-${statut}`)
          );
          expect(segments.map(({ largeur }) => largeur)).toEqual(
            [15, 2, 3].map((nombre) =>
              Math.round((barre.largeur * nombre) / 71)
            )
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

        it('retire les lignes sans catégorie', async () => {
          const slide = await slideAvecLesCategories(
            quatreCategories.slice(0, 3)
          );

          expect(nomsDesFormesCommencantPar(slide, 'categorie-4-')).toEqual([]);
          expect(textesDeLaSlide(slide)).not.toContain('Résilience');
        });
      });

      describe('par niveau de criticité', () => {
        const slideAvecLesCriticites = async (
          parCriticite: StatistiquesDesMesures['parCriticite']
        ) =>
          contenuSlide(
            await genereSupport({
              statistiquesDesMesures: {
                ...statistiquesDesMesuresParDefaut,
                parCriticite,
              },
            }),
            POSITION_STATISTIQUES_DES_MESURES
          );

        it('écrit le nombre de mesures restant à mettre en œuvre, au singulier ou au pluriel', async () => {
          const slide = await slideAvecLesCriticites({
            indispensables: { ...repartitionVide, restant: 48 },
            recommandees: { ...repartitionVide, restant: 1 },
          });

          expect(
            texteDeLaForme(slide, 'criticite-indispensables-restant')
          ).toBe('Il reste 48 mesures à mettre en œuvre');
          expect(texteDeLaForme(slide, 'criticite-recommandees-restant')).toBe(
            'Il reste 1 mesure à mettre en œuvre'
          );
        });

        it('découpe chaque barre en un segment par statut, proportionnel à son nombre de mesures', async () => {
          const slide = await slideAvecLesCriticites({
            indispensables: {
              fait: 2,
              enCours: 25,
              nonFait: 3,
              aLancer: 6,
              aRemplir: 14,
              restant: 48,
            },
            recommandees: { ...repartitionVide, restant: 0 },
          });

          const barre = cadreDeLaForme(slide, 'criticite-indispensables-barre');
          const segments = ['fait', 'enCours', 'nonFait', 'aLancer'].map(
            (statut) =>
              cadreDeLaForme(slide, `criticite-indispensables-${statut}`)
          );
          expect(segments.map(({ largeur }) => largeur)).toEqual(
            [2, 25, 3, 6].map((nombre) =>
              Math.round((barre.largeur * nombre) / 50)
            )
          );
          expect(segments[0].x).toBe(barre.x);
          [1, 2, 3].forEach((index) =>
            expect(segments[index].x).toBe(
              segments[index - 1].x + segments[index - 1].largeur
            )
          );
        });

        it('retire les segments des statuts sans mesure', async () => {
          const slide = await slideAvecLesCriticites({
            indispensables: { ...repartitionVide, fait: 3, restant: 0 },
            recommandees: { ...repartitionVide, aRemplir: 4, restant: 4 },
          });

          expect(nomsDesFormesCommencantPar(slide, 'criticite-')).toEqual([
            'criticite-indispensables-restant',
            'criticite-indispensables-barre',
            'criticite-indispensables-fait',
            'criticite-recommandees-restant',
            'criticite-recommandees-barre',
          ]);
        });
      });
    });

    describe('sur les exigences restantes', () => {
      const POSITION_EXIGENCES_RESTANTES = 21;

      const uneExigence = (
        description: string,
        exigence: Partial<ExigenceRestante> = {}
      ): ExigenceRestante => ({
        description,
        statut: 'enCours',
        cartouches: ['Indispensable', 'ANSSI', 'Gouvernance', '#0022'],
        ...exigence,
      });

      const slideDesExigences = async (
        exigencesRestantes: ExigenceRestante[]
      ) =>
        contenuSlide(
          await genereSupport({ exigencesRestantes }),
          POSITION_EXIGENCES_RESTANTES
        );

      it('écrit une ligne par exigence : description, statut, échéance et porteurs', async () => {
        const slide = await slideDesExigences([
          uneExigence('Identifier les engagements des prestataires', {
            statut: 'enCours',
            echeance: '31/12/2026',
            porteurs: 'Équipe projet et prestataire',
          }),
          uneExigence('Tester la restauration des sauvegardes', {
            statut: 'aLancer',
          }),
        ]);

        expect(
          [1, 2].map((numero) =>
            ['description', 'statut-texte', 'echeance', 'porteurs'].map(
              (partie) => texteDeLaForme(slide, `exigence-${numero}-${partie}`)
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

      it('colore la pastille du statut aux couleurs de MonServiceSécurisé', async () => {
        const slide = await slideDesExigences([
          uneExigence('Partielle', { statut: 'enCours' }),
          uneExigence('À lancer', { statut: 'aLancer' }),
        ]);

        expect(
          [1, 2].map((numero) => [
            couleursDuTexte(slide, `exigence-${numero}-statut-texte`),
            couleurDuFond(slide, `exigence-${numero}-statut-fond`),
          ])
        ).toEqual([
          [['0079D0'], 'DBEEFF'],
          [['7025DA'], 'E9DDFF'],
        ]);
      });

      it('ajuste la largeur de la pastille du statut à son libellé', async () => {
        const slide = await slideDesExigences([
          uneExigence('Partielle', { statut: 'enCours' }),
          uneExigence('À lancer', { statut: 'aLancer' }),
        ]);

        expect(
          [1, 2].map(
            (numero) =>
              cadreDeLaForme(slide, `exigence-${numero}-statut-fond`).largeur
          )
        ).toEqual([1519758, 1447800]);
      });

      describe('pour les cartouches', () => {
        const slideAvecLesCartouches = () =>
          slideDesExigences([
            uneExigence('Une mesure générale', {
              cartouches: ['Indispensable', 'ANSSI', 'Gouvernance', '#0022'],
            }),
            uneExigence('Une mesure spécifique', {
              cartouches: ['Mesures ajoutées', 'Protection'],
            }),
          ]);

        it('écrit chaque cartouche et retire celles qui ne servent pas', async () => {
          const slide = await slideAvecLesCartouches();

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

        it('écrit les cartouches en italique, comme tout ce qui est prérempli, sans rétrécir leur texte', async () => {
          const slide = await slideAvecLesCartouches();

          [1, 2, 3, 4].forEach((numero) => {
            const texte = formeNommee(
              slide,
              `exigence-1-cartouche-${numero}-texte`
            );
            expect(
              Array.from(texte.getElementsByTagName('a:rPr')).map(
                (proprietes) => proprietes.getAttribute('i')
              )
            ).toEqual(['1']);
            expect(texte.getElementsByTagName('a:normAutofit')).toHaveLength(0);
          });
        });

        it('ajuste la largeur de chaque cartouche à son texte et les fait se suivre', async () => {
          const slide = await slideAvecLesCartouches();

          const fonds = [1, 2, 3, 4].map((numero) =>
            cadreDeLaForme(slide, `exigence-1-cartouche-${numero}-fond`)
          );
          const largeursDeLaMaquette = [1677516, 952723, 1639193, 902419];
          fonds.forEach(({ largeur }, index) =>
            expect(
              Math.abs(largeur - largeursDeLaMaquette[index])
            ).toBeLessThan(1000)
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

      describe('quand la description d’une mesure tient sur plusieurs lignes', () => {
        const HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION = 297180;
        const ECART_ENTRE_LIGNES_DU_TABLEAU = 57150;
        const descriptionSurDeuxLignes =
          'Mettre en place une authentification multifacteur pour les administrateurs et les comptes à privilèges';

        const slideAvecUneDescriptionLongue = () =>
          slideDesExigences([
            uneExigence('Une description courte'),
            uneExigence(descriptionSurDeuxLignes),
            uneExigence('Une autre description courte'),
          ]);

        it('écrit la description sur plusieurs lignes au lieu de rétrécir la police', async () => {
          const slide = await slideAvecUneDescriptionLongue();

          expect(
            formeNommee(slide, 'exigence-2-description').getElementsByTagName(
              'a:normAutofit'
            )
          ).toHaveLength(0);
          expect(
            cadreDeLaForme(slide, 'exigence-2-description').hauteur -
              cadreDeLaForme(slide, 'exigence-1-description').hauteur
          ).toBe(HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION);
        });

        it('compte les lignes de la description à la largeur de son texte, pas à son nombre de caractères', async () => {
          const descriptionSurQuatreLignesDansPowerPoint =
            "M 19 Héberger le système d'information et les données auprès d'un prestataire d'informatique en nuage qualifié SecNumCloudHéberger le système d'information et les données auprès d'un prestataire d'informatique en nuage qualifié SecNumCloud";
          const slide = await slideDesExigences([
            uneExigence('Une description courte'),
            uneExigence(descriptionSurQuatreLignesDansPowerPoint),
          ]);

          expect(
            cadreDeLaForme(slide, 'exigence-2-description').hauteur -
              cadreDeLaForme(slide, 'exigence-1-description').hauteur
          ).toBe(3 * HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION);
        });

        it('agrandit la ligne du tableau et descend les cartouches d’autant', async () => {
          const slide = await slideAvecUneDescriptionLongue();

          const cadre = (numero: number, partie: string) => {
            const { y, hauteur } = cadreDeLaForme(
              slide,
              `exigence-${numero}-${partie}`
            );
            const haut = cadreDeLaForme(
              slide,
              `exigence-${numero}-fond-mesure`
            ).y;
            return { decalage: y - haut, hauteur };
          };
          const ecartAvecLaLigneCourte = (
            partie: string,
            mesure: 'decalage' | 'hauteur'
          ) => cadre(2, partie)[mesure] - cadre(1, partie)[mesure];
          expect(
            [
              'fond-mesure',
              'fond-statut',
              'fond-echeance',
              'fond-porteurs',
              'echeance',
              'porteurs',
            ].map((partie) => ecartAvecLaLigneCourte(partie, 'hauteur'))
          ).toEqual(Array(6).fill(HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION));
          expect(
            ['cartouche-1-fond', 'cartouche-1-texte'].map((partie) =>
              ecartAvecLaLigneCourte(partie, 'decalage')
            )
          ).toEqual([
            HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION,
            HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION,
          ]);
          expect(ecartAvecLaLigneCourte('statut-fond', 'decalage')).toBe(
            HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION / 2
          );
        });

        it('place les lignes suivantes sous la ligne agrandie', async () => {
          const slide = await slideAvecUneDescriptionLongue();

          const ligne = (numero: number) =>
            cadreDeLaForme(slide, `exigence-${numero}-fond-mesure`);
          expect(ligne(2).y).toBe(
            ligne(1).y + ligne(1).hauteur + ECART_ENTRE_LIGNES_DU_TABLEAU
          );
          expect(ligne(3).y).toBe(
            ligne(2).y + ligne(2).hauteur + ECART_ENTRE_LIGNES_DU_TABLEAU
          );
        });
      });

      describe('quand les exigences ne tiennent pas sur une page', () => {
        const pagesDesExigences = async (pptx: Buffer) => {
          const positions = Array.from(
            { length: await nombreDeSlides(pptx) },
            (_, index) => index + 1
          );
          const slides = await Promise.all(
            positions.map((position) => contenuSlide(pptx, position))
          );
          return slides.filter((slide) =>
            nomsDesFormes(slide).includes('exigences-restantes-titre')
          );
        };

        const descriptionsDeLaPage = (page: string) =>
          nomsDesFormes(page)
            .filter((nom) => /^exigence-\d+-description$/.test(nom))
            .map((nom) => texteDeLaForme(page, nom));

        const descriptionSurDeuxLignes = (numero: number) =>
          `Exigence ${numero} : documenter et autoriser uniquement les communications nécessaires via des règles de filtrage`;

        it('répartit les exigences sur plusieurs pages, selon la hauteur de leurs lignes', async () => {
          const exigences = [1, 2, 3, 4, 5, 6].map((numero) =>
            uneExigence(descriptionSurDeuxLignes(numero))
          );

          const pages = await pagesDesExigences(
            await genereSupport({ exigencesRestantes: exigences })
          );

          expect(pages.map(descriptionsDeLaPage)).toEqual([
            [1, 2, 3, 4].map(descriptionSurDeuxLignes),
            [5, 6].map(descriptionSurDeuxLignes),
          ]);
        });

        it('ne met pas plus de 5 exigences par page, le nombre de lignes du modèle', async () => {
          const exigences = [1, 2, 3, 4, 5, 6].map((numero) =>
            uneExigence(`Exigence ${numero}`)
          );

          const pages = await pagesDesExigences(
            await genereSupport({ exigencesRestantes: exigences })
          );

          expect(pages.map(descriptionsDeLaPage)).toEqual([
            [
              'Exigence 1',
              'Exigence 2',
              'Exigence 3',
              'Exigence 4',
              'Exigence 5',
            ],
            ['Exigence 6'],
          ]);
        });

        it('numérote les pages dans le titre', async () => {
          const exigences = [1, 2, 3, 4, 5, 6].map((numero) =>
            uneExigence(`Exigence ${numero}`)
          );

          const pages = await pagesDesExigences(
            await genereSupport({ exigencesRestantes: exigences })
          );

          expect(
            pages.map((page) =>
              texteDeLaForme(page, 'exigences-restantes-titre')
            )
          ).toEqual([
            'Exigences à mettre en place restantes 1/2',
            'Exigences à mettre en place restantes 2/2',
          ]);
        });

        it('garde le titre sur une ligne avec une pagination à deux chiffres, sans toucher la pastille « Prérempli »', async () => {
          const largeurDeTitreAvec99Sur99EnArialGras = 10750115;
          const margesInternesDuCadre = 2 * 25400;
          const slide = await slideDesExigences([uneExigence('Exigence')]);

          const titre = cadreDeLaForme(slide, 'exigences-restantes-titre');
          const pastille = cadreDeLaForme(slide, 'pastille-prerempli');

          expect(titre.largeur).toBeGreaterThanOrEqual(
            largeurDeTitreAvec99Sur99EnArialGras + margesInternesDuCadre
          );
          expect(titre.x + titre.largeur).toBeLessThan(pastille.x);
        });
      });

      it('retire les lignes sans exigence', async () => {
        const slide = await slideDesExigences([uneExigence('Seule exigence')]);

        expect(
          nomsDesFormes(slide).filter((nom) => /^exigence-[2-5]-/.test(nom))
        ).toEqual([]);
        expect(nomsDesFormesCommencantPar(slide, 'exigence-1-')).toHaveLength(
          17
        );
      });
    });

    describe('sur les avis des membres', () => {
      const POSITION_AVIS_DES_MEMBRES = 25;

      const unAvis = (
        membres: string,
        avis: Partial<AvisDUnMembre> = {}
      ): AvisDUnMembre => ({
        membres,
        avis: 'Favorable',
        duree: '1 an',
        commentaire: '',
        ...avis,
      });

      const slideDesAvis = async (avisDesMembres: AvisDUnMembre[]) =>
        contenuSlide(
          await genereSupport({ avisDesMembres }),
          POSITION_AVIS_DES_MEMBRES
        );

      it('écrit une carte par avis : membres, avis, durée et commentaire', async () => {
        const slide = await slideDesAvis([
          unAvis('Jean Dupond, Marie Curie', {
            avis: 'Favorable avec réserves',
            duree: '6 mois',
            commentaire: 'Revoir la politique de mots de passe',
          }),
          unAvis('Paul Martin', { avis: 'Défavorable', duree: '1 an' }),
        ]);

        expect(
          [1, 2].map((numero) =>
            ['membres', 'avis', 'duree', 'commentaire'].map((partie) =>
              texteDeLaForme(slide, `avis-${numero}-${partie}`)
            )
          )
        ).toEqual([
          [
            'Jean Dupond, Marie Curie',
            'Favorable avec réserves',
            '6 mois',
            'Revoir la politique de mots de passe',
          ],
          ['Paul Martin', 'Défavorable', '1 an', ''],
        ]);
      });

      describe('pour la mise en page d’une carte', () => {
        const MARGE_DANS_LA_CARTE = 266700;
        const ECART_SOUS_UNE_VALEUR = 228600;
        const ECART_SOUS_UN_LIBELLE = 38100;
        const HAUTEUR_D_UN_LIBELLE = 300038;
        const HAUTEUR_D_UNE_VALEUR_SUR_UNE_LIGNE = 300038;
        const HAUTEUR_D_UNE_LIGNE_DE_VALEUR = 261937;
        const HAUTEUR_D_UNE_LIGNE_DES_MEMBRES = 355880;

        const basDe = (slide: string, nom: string) => {
          const { y, hauteur } = cadreDeLaForme(slide, nom);
          return y + hauteur;
        };

        it('garde les textes dans la carte, avec la même marge à gauche et à droite', async () => {
          const slide = await slideDesAvis([
            unAvis('Ludmilla Cara, Thomas Berthelot'),
          ]);

          const carte = cadreDeLaForme(slide, 'avis-1-carte');
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
              const { x, largeur } = cadreDeLaForme(slide, `avis-1-${partie}`);
              return [x - carte.x, carte.x + carte.largeur - (x + largeur)];
            })
          ).toEqual(Array(7).fill([MARGE_DANS_LA_CARTE, MARGE_DANS_LA_CARTE]));
        });

        it('écrit le commentaire avec un paragraphe par ligne, sans rétrécir la police', async () => {
          const slide = await slideDesAvis([
            unAvis('Jean Dupond', { commentaire: 'Ok\n\nÀ revoir' }),
          ]);

          expect(paragraphesDeLaForme(slide, 'avis-1-commentaire')).toEqual([
            'Ok',
            '',
            'À revoir',
          ]);
          expect(
            ['membres', 'avis', 'duree', 'commentaire'].map(
              (partie) =>
                formeNommee(slide, `avis-1-${partie}`).getElementsByTagName(
                  'a:normAutofit'
                ).length
            )
          ).toEqual([0, 0, 0, 0]);
        });

        it('empile chaque libellé sous la valeur qui le précède, et chaque valeur sous son libellé', async () => {
          const slide = await slideDesAvis([
            unAvis('Jean Dupond', { avis: 'Favorable' }),
          ]);

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

        it('agrandit les membres et l’avis qui tiennent sur plusieurs lignes, sans rétrécir leur police', async () => {
          const slide = await slideDesAvis([
            unAvis('Jean Dupond', { avis: 'Favorable' }),
            unAvis('Ludmilla Cara, Thomas Berthelot', {
              avis: 'Favorable avec réserve : mettre en place le MFA',
            }),
          ]);

          const ecartDeHauteur = (partie: string) =>
            cadreDeLaForme(slide, `avis-2-${partie}`).hauteur -
            cadreDeLaForme(slide, `avis-1-${partie}`).hauteur;
          expect(ecartDeHauteur('membres')).toBe(
            HAUTEUR_D_UNE_LIGNE_DES_MEMBRES
          );
          expect(ecartDeHauteur('avis')).toBe(HAUTEUR_D_UNE_LIGNE_DE_VALEUR);
        });

        it('étire le commentaire jusqu’au bas de la carte', async () => {
          const slide = await slideDesAvis([unAvis('Jean Dupond')]);

          expect(basDe(slide, 'avis-1-commentaire')).toBe(
            basDe(slide, 'avis-1-carte') - MARGE_DANS_LA_CARTE
          );
        });

        it('réduit la police du commentaire à la plus grande taille qui tient dans la carte : 18, 16 puis 14 pt', async () => {
          const unCommentaireSur = (lignes: number) =>
            Array(lignes).fill('Une ligne').join('\n');
          const slide = await slideDesAvis(
            [11, 12, 13, 14].map((lignes) =>
              unAvis('Jean Dupond', {
                commentaire: unCommentaireSur(lignes),
              })
            )
          );

          expect(
            [1, 2, 3, 4].map((numero) => [
              ...new Set(taillesDePolice(slide, `avis-${numero}-commentaire`)),
            ])
          ).toEqual([['1800'], ['1600'], ['1600'], ['1400']]);
        });
      });

      it('retire les cartes sans avis', async () => {
        const slide = await slideDesAvis([unAvis('Seul membre')]);

        expect(
          nomsDesFormes(slide).filter((nom) => /^avis-[2-4]-/.test(nom))
        ).toEqual([]);
        expect(nomsDesFormesCommencantPar(slide, 'avis-1-')).toHaveLength(9);
      });
    });

    describe('sur la description des risques', () => {
      const POSITION_DESCRIPTION_DES_RISQUES = 14;

      const unRisque = (identifiant: string): RisqueCartographie => ({
        identifiant,
        intitule: `Intitulé de ${identifiant}`,
        description: `Description de ${identifiant}`,
        gravite: 2,
        vraisemblance: 2,
        niveau: 'faible',
      });

      it('suit la cartographie brute et décrit chaque risque à date, en retirant les lignes inutilisées', async () => {
        const pptx = await genereSupport({
          cartographiesDesRisques: {
            ...cartographiesParDefaut,
            aDate: [unRisque('R1'), unRisque('RS1')],
          },
        });

        const description = await contenuSlide(
          pptx,
          POSITION_DESCRIPTION_DES_RISQUES
        );
        expect(textesDeLaSlide(description)).toContain(
          'Description des risques'
        );
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

      it('colore la pastille de chaque risque selon son niveau à date', async () => {
        const pptx = await genereSupport({
          cartographiesDesRisques: {
            ...cartographiesParDefaut,
            aDate: [
              { ...unRisque('R1'), niveau: 'faible' },
              { ...unRisque('R2'), niveau: 'moyen' },
              { ...unRisque('R3'), niveau: 'eleve' },
              { ...unRisque('RS1'), niveau: 'nonEvalue' },
            ],
          },
        });

        const description = await contenuSlide(
          pptx,
          POSITION_DESCRIPTION_DES_RISQUES
        );
        expect(
          [1, 2, 3, 4].map((numero) =>
            couleurDuFond(description, `description-risque-${numero}-pastille`)
          )
        ).toEqual(['84C14E', 'FAC63C', 'F8785B', 'EEEEEE']);
      });

      describe('quand les risques ne tiennent pas sur une page', () => {
        const pagesDeLaDescription = async (pptx: Buffer) => {
          const positions = Array.from(
            { length: await nombreDeSlides(pptx) },
            (_, index) => index + 1
          );
          const slides = await Promise.all(
            positions.map((position) => contenuSlide(pptx, position))
          );
          return slides.filter((slide) =>
            nomsDesFormes(slide).includes('description-risques-total')
          );
        };

        const identifiantsDeLaPage = (page: string) =>
          nomsDesFormes(page)
            .filter((nom) => /^description-risque-\d+-identifiant$/.test(nom))
            .map((nom) => texteDeLaForme(page, nom));

        const descriptionDeTroisLignes = Array.from(
          { length: 3 },
          () =>
            'Pour atteindre son objectif visé, un attaquant externe va compromettre'
        ).join(' ');

        const huitRisques = Array.from({ length: 8 }, (_, index) => ({
          ...unRisque(`R${index + 1}`),
          description: descriptionDeTroisLignes,
        }));

        it('répartit les risques sur plusieurs pages, selon la hauteur de leurs lignes', async () => {
          const pptx = await genereSupport({
            cartographiesDesRisques: {
              ...cartographiesParDefaut,
              aDate: huitRisques,
            },
          });

          const pages = await pagesDeLaDescription(pptx);
          expect(pages.map(identifiantsDeLaPage)).toEqual([
            ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'],
            ['R8'],
          ]);
          pages.forEach((page) =>
            expect(texteDeLaForme(page, 'description-risques-total')).toBe(
              '8 risques'
            )
          );
        });

        it('numérote les pages dans le titre', async () => {
          const pptx = await genereSupport({
            cartographiesDesRisques: {
              ...cartographiesParDefaut,
              aDate: huitRisques,
            },
          });

          const pages = await pagesDeLaDescription(pptx);
          expect(
            pages.map((page) =>
              texteDeLaForme(page, 'description-risques-titre')
            )
          ).toEqual([
            'Description des risques 1/2',
            'Description des risques 2/2',
          ]);
        });
      });

      describe('pour les lignes de la description', () => {
        const HAUTEUR_D_UNE_LIGNE_DE_TEXTE_EN_18_PT = 274320;
        const MARGES_D_UNE_LIGNE = 76200 + 50800;
        const ECART_ENTRE_LIGNES = 38100;
        const motsRepetes = (mot: string, nombre: number) =>
          Array.from({ length: nombre }, () => mot).join(' ');

        const descriptionAvec = async (risques: RisqueCartographie[]) =>
          contenuSlide(
            await genereSupport({
              cartographiesDesRisques: {
                ...cartographiesParDefaut,
                aDate: risques,
              },
            }),
            POSITION_DESCRIPTION_DES_RISQUES
          );

        it('prennent la hauteur de la plus haute des deux colonnes de texte, en 18 pt', async () => {
          const description = await descriptionAvec([
            {
              ...unRisque('R1'),
              intitule: motsRepetes('intitulé', 20),
              description: 'Courte',
            },
            {
              ...unRisque('R2'),
              intitule: 'Court',
              description: motsRepetes('description', 40),
            },
          ]);

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

        it('s’empilent sous l’en-tête, séparées par l’écart de la maquette', async () => {
          const description = await descriptionAvec([
            unRisque('R1'),
            { ...unRisque('R2'), description: motsRepetes('description', 40) },
            unRisque('R3'),
          ]);

          const fond = (numero: number) =>
            cadreDeLaForme(
              description,
              `description-risque-${numero}-fond-reference`
            );
          expect(fond(1).y).toBe(2708970);
          [2, 3].forEach((numero) =>
            expect(fond(numero).y).toBe(
              fond(numero - 1).y + fond(numero - 1).hauteur + ECART_ENTRE_LIGNES
            )
          );
        });

        it('alignent les fonds de la ligne, centrent la pastille et ajustent les zones de texte', async () => {
          const description = await descriptionAvec([
            unRisque('R1'),
            { ...unRisque('R2'), description: motsRepetes('description', 40) },
          ]);

          const cadre = (partie: string) =>
            cadreDeLaForme(description, `description-risque-2-${partie}`);
          const fond = cadre('fond-reference');
          ['fond-intitule', 'fond-description'].forEach((partie) =>
            expect([cadre(partie).y, cadre(partie).hauteur]).toEqual([
              fond.y,
              fond.hauteur,
            ])
          );
          const pastille = cadre('pastille');
          expect(pastille.y).toBe(
            fond.y + Math.floor((fond.hauteur - pastille.hauteur) / 2)
          );
          expect(cadre('identifiant').y).toBe(pastille.y + 19050);
          ['intitule', 'description'].forEach((partie) =>
            expect([cadre(partie).y, cadre(partie).hauteur]).toEqual([
              fond.y + 38100,
              fond.hauteur - 76200,
            ])
          );
        });
      });
    });

    it('écrit la date de création au format court, après son libellé', async () => {
      const pptx = await genereSupport();

      const couverture = await contenuSlide(pptx, 1);
      expect(textesDeLaSlide(couverture)).toContain('Date de création : ');
      expect(textesDeLaSlide(couverture)).toContain('09/11/2026');
    });

    describe('produit un fichier que PowerPoint ouvre sans le réparer', () => {
      it('ne déclare chaque partie du fichier qu’une seule fois', async () => {
        const pptx = await genereSupport();

        const parties = await partiesDeclarees(pptx);
        const doublons = parties.filter(
          (partie, index) => parties.indexOf(partie) !== index
        );
        expect(doublons).toEqual([]);
      });

      it('ne contient aucune relation vers une partie absente du fichier', async () => {
        const pptx = await genereSupport();

        expect(await relationsCassees(pptx)).toEqual([]);
      });

      it('ne déclare aucune partie absente du fichier', async () => {
        const pptx = await genereSupport();

        expect(await partiesDeclareesAbsentes(pptx)).toEqual([]);
      });

      it('compresse les fichiers de l’archive', async () => {
        const pptx = await genereSupport();

        expect(fichiersNonCompresses(pptx)).toEqual([]);
      });

      it('donne un identifiant unique à chaque forme d’une slide', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            donneesIdentifiees: [
              'Documents RH sensibles',
              'Plannings des agents',
            ],
          },
        });

        expect(await identifiantsDeFormesEnDouble(pptx)).toEqual([]);
      });
    });
  });
});

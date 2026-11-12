import { readFile } from 'node:fs/promises';
import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import {
  contenuSlide,
  fichiersNonCompresses,
  identifiantsDeFormesEnDouble,
  imageDeLaForme,
  nombreDeSlides,
  partiesDeclarees,
  partiesDeclareesAbsentes,
  relationsCassees,
} from '../aides/lecturePptx.js';
import { DonneesSupportCommissionHomologation } from '../../src/adaptateurs/adaptateurPowerpoint.interface.js';
import { PieceDuDossier } from '../../src/modeles/objetsPowerpoint/piecesDuDossier.js';
import { ContexteDuService } from '../../src/modeles/objetsPowerpoint/contexteDuService.js';
import { BesoinsDeSecurite } from '../../src/modeles/objetsPowerpoint/besoinsDeSecurite.js';
import { CartographiesDesRisques } from '../../src/modeles/objetsPowerpoint/cartographiesDesRisques.js';
import { RisqueCartographie } from '../../src/modeles/objetsPowerpoint/risqueCartographie.js';
import { Gravite } from '../../src/moteurRisques/v2/graviteObjectifsVises.js';
import { Vraisemblance } from '../../src/moteurRisques/v2/vraisemblance/vraisemblance.types.js';

const texteDeLaForme = (slide: string, nom: string) => {
  const forme = slide.match(
    new RegExp(`name="${nom}"(?:(?!</p:sp>).)*</p:sp>`, 's')
  );
  if (!forme) throw new Error(`Forme ${nom} absente de la slide`);
  return [...forme[0].matchAll(/<a:t>([^<]*)<\/a:t>/g)]
    .map(([, texte]) => texte)
    .join('');
};

const cadreDeLaForme = (slide: string, nom: string) => {
  const cadre = slide.match(
    new RegExp(
      `name="${nom}"(?:(?!</p:(?:sp|pic)>).)*?<a:off x="(\\d+)" y="(\\d+)"/>\\s*<a:ext cx="(\\d+)" cy="(\\d+)"/>`,
      's'
    )
  );
  if (!cadre) throw new Error(`Forme ${nom} absente de la slide`);
  const [, x, y, largeur, hauteur] = cadre.map(Number);
  return { x, y, largeur, hauteur };
};

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
      ...donnees,
    });

  describe('quand il génère le support de commission d’homologation', () => {
    it('contient, dans l’ordre, la couverture, le sommaire, la composition de la commission, les pièces du dossier, la présentation du système, le contexte, le périmètre de l’analyse, les objectifs de sécurité, l’historique et les cartographies des risques bruts, à date et résiduels cible', async () => {
      const pptx = await genereSupport();

      expect(await nombreDeSlides(pptx)).toBe(16);
      expect(await contenuSlide(pptx, 1)).toContain(
        '<a:t>Support de commission d’homologation</a:t>'
      );
      expect(await contenuSlide(pptx, 2)).toContain('<a:t>Sommaire</a:t>');
      expect(await contenuSlide(pptx, 3)).toContain(
        '<a:t>Composition de la commission</a:t>'
      );
      const pagePieces = await contenuSlide(pptx, 4);
      expect(pagePieces).toContain(
        '<a:t>Pièces du dossier transmises avant la séance</a:t>'
      );
      expect(pagePieces).not.toContain(
        'Composition de la commission et contenu du dossier'
      );
      const presentationDuSysteme = await contenuSlide(pptx, 5);
      expect(presentationDuSysteme).toContain(
        '<a:t>1. Présentation du système</a:t>'
      );
      expect(presentationDuSysteme).toContain('<a:t>Logo</a:t>');
      expect(await contenuSlide(pptx, 6)).toContain('<a:t>Contexte</a:t>');
      expect(await contenuSlide(pptx, 7)).toContain(
        '<a:t>Périmètre de l’analyse : Vue fonctionnelle</a:t>'
      );
      expect(await contenuSlide(pptx, 8)).toContain(
        '<a:t>Périmètre de l’analyse : Description technique</a:t>'
      );
      expect(await contenuSlide(pptx, 9)).toContain(
        '<a:t>Objectifs de sécurité, impacts et exposition</a:t>'
      );
      const intercalaireHistorique = await contenuSlide(pptx, 10);
      expect(intercalaireHistorique).toContain('<a:t>2. Historique</a:t>');
      expect(intercalaireHistorique).toContain('<a:t>Logo</a:t>');
      expect(await contenuSlide(pptx, 11)).toContain('<a:t>EVÈNEMENT</a:t>');
      expect(await contenuSlide(pptx, 12)).toContain(
        '<a:t>3. Détail : Risques et plan d’action</a:t>'
      );
      expect(await contenuSlide(pptx, 13)).toContain(
        '<a:t>Cartographie des risques bruts</a:t>'
      );
    });

    it("écrit le nom et la fonction de l'autorité d'homologation dans la composition de la commission", async () => {
      const pptx = await genereSupport({
        autorite: { nom: 'Jean Dupond', fonction: 'RSSI' },
      });

      expect(await contenuSlide(pptx, 3)).toContain(
        '<a:t>Jean Dupond, RSSI</a:t>'
      );
    });

    it("ne laisse pas l'autorité d'homologation à compléter quand elle est renseignée", async () => {
      const pptx = await genereSupport({
        autorite: { nom: 'Jean Dupond', fonction: 'RSSI' },
      });

      expect(await contenuSlide(pptx, 3)).not.toContain(
        'autorite-homologation-a-completer'
      );
    });

    it("laisse l'autorité d'homologation à compléter par le projet quand elle n'est pas renseignée", async () => {
      const pptx = await genereSupport();

      const commission = await contenuSlide(pptx, 3);
      expect(commission).not.toContain('name="autorite-homologation"');
      expect(commission).toContain(
        'name="autorite-homologation-a-completer-texte"'
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
          slide.includes('name="titre-page-pieces"')
        ).length;
      };

      const titreDeLaPage = (page: string) => {
        const [titre] = page.match(
          /name="titre-page-pieces"(?:(?!<\/p:sp>).)*<\/p:sp>/s
        )!;
        return [...titre.matchAll(/<a:t>([^<]*)<\/a:t>/g)]
          .map(([, texte]) => texte)
          .join('');
      };

      const ligne = (page: string, numero: number, partie: string) =>
        page.match(
          new RegExp(
            `name="piece-${numero}-${partie}"(?:(?!</p:sp>).)*</p:sp>`,
            's'
          )
        )?.[0] ?? '';

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
        expect(ligne(page, 1, 'case')).toContain('<a:t>☑</a:t>');
        expect(ligne(page, 1, 'intitule')).toContain(
          '<a:t>Présent support de commission</a:t>'
        );
        expect(ligne(page, 1, 'source')).toContain(
          '<a:t>MonServiceSécurisé</a:t>'
        );
        expect(ligne(page, 2, 'case')).toContain('<a:t>☐</a:t>');
        expect(ligne(page, 2, 'intitule')).toContain(
          '<a:t>Charte informatique</a:t>'
        );
        expect(ligne(page, 2, 'source')).toContain('<a:t>Utilisateur</a:t>');
      });

      it('retire la version à compléter des lignes remplies', async () => {
        const pptx = await genereSupport({
          piecesDuDossier: [unePiece('Une pièce')],
        });

        const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
        expect(page).not.toContain('name="piece-1-a-completer-');
      });

      it('laisse les lignes au-delà des pièces à compléter par le projet', async () => {
        const pptx = await genereSupport({
          piecesDuDossier: [unePiece('Une pièce')],
        });

        const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
        expect(page).not.toContain('name="piece-2-intitule"');
        expect(page).not.toContain('name="piece-2-source"');
        expect(page).toContain('name="piece-2-a-completer-intitule-texte"');
        expect(ligne(page, 2, 'case')).toContain('<a:t>☐</a:t>');
        expect(page).toContain('name="piece-16-a-completer-reference-texte"');
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
        expect(ligne(deuxiemePage, 1, 'intitule')).toContain(
          '<a:t>Pièce 17</a:t>'
        );
        expect(ligne(deuxiemePage, 4, 'intitule')).toContain(
          '<a:t>Pièce 20</a:t>'
        );
        expect(deuxiemePage).toContain(
          'name="piece-5-a-completer-intitule-texte"'
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
        expect(pageVide).not.toContain('Prérempli par MonServiceSécurisé');
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
          Number(
            ligne(page, numero, partie).match(/<a:off x="\d+" y="(\d+)"/)![1]
          );

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
          expect(ligne(page, 1, 'intitule')).toContain(
            '<a:t>Avis écrits des collaborateurs</a:t>'
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
          Number(
            ligne(page, numero, 'case').match(/<a:off x="\d+" y="(\d+)"/)![1]
          );
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

      const formeDescription = (slide: string) =>
        slide.match(
          /name="contexte-description"(?:(?!<\/p:sp>).)*<\/p:sp>/s
        )![0];

      const taillesDePolice = (forme: string) => [
        ...new Set(
          [...forme.matchAll(/<a:rPr [^>]*sz="(\d+)"/g)].map(([, sz]) => sz)
        ),
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
        expect(contexte).not.toContain('Portail RH permettant');
        expect(contexte).toContain(
          '<a:t>Un portail de démarches en ligne</a:t>'
        );
      });

      it('réduit la police de la description à 16 pt quand elle dépasse deux lignes à 21 pt', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, description: descriptionDe(20) },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(taillesDePolice(formeDescription(contexte))).toEqual(['1600']);
      });

      it('réduit la police de la description à 14 pt quand elle dépasse trois lignes à 16 pt', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, description: descriptionDe(35) },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(taillesDePolice(formeDescription(contexte))).toEqual(['1400']);
      });

      it('compte chaque saut de ligne de la description comme une nouvelle ligne', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Premier paragraphe\n\nSecond paragraphe',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(taillesDePolice(formeDescription(contexte))).toEqual(['1600']);
      });

      it('coupe la description par « … » quand elle dépasse quatre lignes à 14 pt', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, description: descriptionDe(60) },
        });

        const description = formeDescription(
          await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE)
        );
        const [, texte] = description.match(/<a:t>([^<]*)<\/a:t>/)!;
        expect(texte).toBe(`${descriptionDe(40)}…`);
        expect(taillesDePolice(description)).toEqual(['1400']);
      });

      it('coupe aussi la description aux sauts de ligne quand elle dépasse quatre lignes à 14 pt', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Premier paragraphe\n\n\n\nDernier paragraphe',
          },
        });

        const description = formeDescription(
          await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE)
        );
        expect(description).toContain('<a:t>Premier paragraphe…</a:t>');
        expect(description).not.toContain('Dernier paragraphe');
      });

      it('écrit chaque ligne de la description dans son propre paragraphe', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Premier paragraphe\n\nSecond paragraphe',
          },
        });

        const description = formeDescription(
          await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE)
        );
        const paragraphes = [...description.matchAll(/<a:p>.*?<\/a:p>/gs)].map(
          ([paragraphe]) =>
            [...paragraphe.matchAll(/<a:t>([^<]*)<\/a:t>/g)]
              .map(([, texte]) => texte)
              .join('')
        );
        expect(paragraphes).toEqual([
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
        expect(contexte).not.toContain('Commune de Villeneuve');
        expect(contexte).toContain(
          '<a:t>Commune de Saint-Ours (987 654 321 00020)</a:t>'
        );
      });

      it('écrit le statut de déploiement', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, statut: 'En conception' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('En production');
        expect(contexte).toContain('<a:t>En conception</a:t>');
      });

      it('écrit les URL du projet', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, urls: 'https://rh.exemple.fr' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('https://rh.villeneuve.fr');
        expect(contexte).toContain('<a:t>https://rh.exemple.fr</a:t>');
      });

      it('écrit le type de projet', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            typeDeProjet: 'Application mobile',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('Service en ligne, Portail');
        expect(contexte).toContain('<a:t>Application mobile</a:t>');
      });

      it('écrit l’hébergement', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, hebergement: 'Autre' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('Le système est entièrement fourni');
        expect(contexte).toContain('<a:t>Autre</a:t>');
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
        expect(contexte).not.toContain('Au sein de l’Union européenne');
        expect(contexte).toContain(
          "<a:t>En partie ou totalement hors de l'Union européenne</a:t>"
        );
      });

      it('écrit les sécurisations prévues', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, securisations: 'Un annuaire' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('Des postes de travail');
        expect(contexte).toContain('<a:t>Un annuaire</a:t>');
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
        expect(besoins).not.toContain('name="donnee-identifiee-3"');
        expect(besoins).not.toContain('name="donnee-identifiee"');
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
          [...besoins.matchAll(/name="(donnee-identifiee-\d+)"/g)].map(
            ([, nom]) => nom
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
              [
                ...besoins
                  .match(
                    new RegExp(`name="${nom}"(?:(?!</p:sp>).)*</p:sp>`, 's')
                  )![0]
                  .matchAll(/<a:rPr [^>]*sz="(\d+)"/g),
              ].map(([, sz]) => sz)
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
        expect(besoins).not.toContain('name="besoins-anssi-');
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
        expect(cartographie).not.toContain('R3, R7, R9, R11, R14');
        expect(cartographie).not.toContain('<a:t>R1, R5</a:t>');
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
        expect(cartographie).not.toContain('name="risque-3-');
        expect(cartographie).not.toContain(
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
        const couleurDuFond = (nom: string) =>
          cartographie
            .match(new RegExp(`name="${nom}"(?:(?!</p:sp>).)*</p:sp>`, 's'))![0]
            .match(/<p:spPr>.*?<a:srgbClr val="([0-9A-F]{6})"/s)![1];
        expect(couleurDuFond('risque-1-pastille')).toBe('84C14E');
        expect(couleurDuFond('risque-2-pastille')).toBe('FAC63C');
        expect(couleurDuFond('risque-3-pastille')).toBe('F8785B');
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
        const [pastille] = cartographie.match(
          /name="risque-1-pastille"(?:(?!<\/p:sp>).)*<\/p:sp>/s
        )!;
        expect(
          pastille.match(/<p:spPr>.*?<a:srgbClr val="([0-9A-F]{6})"/s)![1]
        ).toBe('EEEEEE');
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
              slide.includes('name="liste-risques-total"') &&
              texteDeLaForme(slide, 'cartographie-titre').startsWith(
                'Cartographie des risques bruts'
              )
          );
        };

        const identifiantsDeLaPage = (page: string) =>
          [...page.matchAll(/name="risque-\d+-identifiant"/g)].map(([nom]) =>
            texteDeLaForme(page, nom.slice(6, -1))
          );

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

      const tailleDePoliceDeLaCase = (cartographie: string, nom: string) => {
        const [forme] = cartographie.match(
          new RegExp(`name="${nom}"(?:(?!</p:sp>).)*</p:sp>`, 's')
        )!;
        return [...forme.matchAll(/<a:rPr [^>]*sz="(\d+)"/g)].map(
          ([, sz]) => sz
        );
      };

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
        expect(tailleDePoliceDeLaCase(cartographie, 'matrice-g4-v4')).toEqual([
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
        expect(tailleDePoliceDeLaCase(cartographie, 'matrice-g4-v4')).toEqual([
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
        expect(description).toContain('<a:t>Description des risques</a:t>');
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
        expect(description).not.toContain('name="description-risque-3-');
        expect(description).not.toContain('Un attaquant externe compromet');
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
        const couleurDuFond = (nom: string) =>
          description
            .match(new RegExp(`name="${nom}"(?:(?!</p:sp>).)*</p:sp>`, 's'))![0]
            .match(/<p:spPr>.*?<a:srgbClr val="([0-9A-F]{6})"/s)![1];
        expect(
          [1, 2, 3, 4].map((numero) =>
            couleurDuFond(`description-risque-${numero}-pastille`)
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
            slide.includes('name="description-risques-total"')
          );
        };

        const identifiantsDeLaPage = (page: string) =>
          [
            ...page.matchAll(/name="(description-risque-\d+-identifiant)"/g),
          ].map(([, nom]) => texteDeLaForme(page, nom));

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
      expect(couverture).toContain('<a:t>Date de création : </a:t>');
      expect(couverture).toContain('<a:t>09/11/2026</a:t>');
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

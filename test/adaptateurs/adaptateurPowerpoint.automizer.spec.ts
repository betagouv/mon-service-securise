import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import {
  contenuSlide,
  fichiersNonCompresses,
  nombreDeSlides,
  partiesDeclarees,
  partiesDeclareesAbsentes,
  relationsCassees,
} from '../aides/lecturePptx.js';
import { DonneesSupportCommissionHomologation } from '../../src/adaptateurs/adaptateurPowerpoint.interface.js';
import { PieceDuDossier } from '../../src/modeles/objetsPowerpoint/piecesDuDossier.js';
import { ContexteDuService } from '../../src/modeles/objetsPowerpoint/contexteDuService.js';

const unePiece = (intitule: string): PieceDuDossier => ({
  intitule,
  source: 'MonServiceSécurisé',
  cochee: false,
});

describe("L'adaptateur PowerPoint utilisant pptx-automizer", () => {
  const POSITION_SLIDE_PIECES = 4;

  const adaptateur = new AdaptateurPowerpointAutomizer();

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
      ...donnees,
    });

  describe('quand il génère le support de commission d’homologation', () => {
    it('contient, dans l’ordre, la couverture, le sommaire, la composition de la commission, les pièces du dossier, la présentation du système et le contexte', async () => {
      const pptx = await genereSupport();

      expect(await nombreDeSlides(pptx)).toBe(6);
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
    });
  });
});

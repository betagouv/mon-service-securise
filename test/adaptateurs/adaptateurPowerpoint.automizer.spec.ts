import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import { contenuSlide, nombreDeSlides } from '../aides/lecturePptx.js';
import { DonneesSupportCommissionHomologation } from '../../src/adaptateurs/adaptateurPowerpoint.interface.js';
import { PieceDuDossier } from '../../src/modeles/objetsPowerpoint/piecesDuDossier.js';

const unePiece = (intitule: string): PieceDuDossier => ({
  intitule,
  source: 'MonServiceSécurisé',
  cochee: false,
});

describe("L'adaptateur PowerPoint utilisant pptx-automizer", () => {
  const POSITION_SLIDE_PIECES = 4;

  const adaptateur = new AdaptateurPowerpointAutomizer();

  const genereSupport = (
    donnees: Partial<DonneesSupportCommissionHomologation> = {}
  ) =>
    adaptateur.genereSupportCommissionHomologation({
      dateCreation: new Date(2026, 10, 9),
      piecesDuDossier: [unePiece('Une pièce du dossier')],
      ...donnees,
    });

  describe('quand il génère le support de commission d’homologation', () => {
    it('contient, dans l’ordre, la couverture, le sommaire, la composition de la commission et les pièces du dossier', async () => {
      const pptx = await genereSupport();

      expect(await nombreDeSlides(pptx)).toBe(4);
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

        expect(await nombreDeSlides(pptx)).toBe(5);
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

        expect(await nombreDeSlides(pptx)).toBe(5);
        expect(
          titreDeLaPage(await contenuSlide(pptx, POSITION_SLIDE_PIECES))
        ).toBe('Pièces du dossier transmises avant la séance 1/2');
        const pageVide = await contenuSlide(pptx, POSITION_SLIDE_PIECES + 1);
        expect(titreDeLaPage(pageVide)).toBe(
          'Pièces du dossier transmises avant la séance 2/2'
        );
        expect(pageVide).not.toContain('Prérempli par MonServiceSécurisé');
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

    it('écrit la date de création au format court, après son libellé', async () => {
      const pptx = await genereSupport();

      const couverture = await contenuSlide(pptx, 1);
      expect(couverture).toContain('<a:t>Date de création : </a:t>');
      expect(couverture).toContain('<a:t>09/11/2026</a:t>');
    });
  });
});

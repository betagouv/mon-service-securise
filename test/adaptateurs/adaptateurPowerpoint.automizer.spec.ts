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
      expect(await contenuSlide(pptx, 4)).toContain(
        '<a:t>Composition de la commission et contenu du dossier</a:t>'
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

    it('écrit les pièces du dossier, dans l’ordre, une par ligne', async () => {
      const pptx = await genereSupport({
        piecesDuDossier: [
          unePiece('Première pièce'),
          unePiece('Deuxième pièce'),
        ],
      });

      const commission = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
      expect(commission).toMatch(
        /name="piece-1-texte".*<a:t>Première pièce<\/a:t>.*name="piece-2-texte".*<a:t>Deuxième pièce<\/a:t>/s
      );
    });

    it('retire les lignes de pièces au-delà de la liste', async () => {
      const pptx = await genereSupport({
        piecesDuDossier: [
          unePiece('Première pièce'),
          unePiece('Deuxième pièce'),
        ],
      });

      const commission = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
      expect(commission).toContain('name="piece-2-separateur"');
      expect(commission).not.toMatch(/name="piece-[3-6]-/);
    });

    it('ajoute des lignes de pièces sous la dernière ligne du template quand la liste la dépasse', async () => {
      const pptx = await genereSupport({
        piecesDuDossier: [
          unePiece('Pièce 1'),
          unePiece('Pièce 2'),
          unePiece('Pièce 3'),
          unePiece('Pièce 4'),
          unePiece('Pièce 5'),
          unePiece('Pièce 6'),
          unePiece('Pièce 7'),
          unePiece('Pièce 8'),
        ],
      });

      const commission = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
      const ordonneeDuTexte = (piece: string) => {
        const [, ordonnee] = commission.match(
          new RegExp(
            `<a:off x="\\d+" y="(\\d+)"/>(?:(?!</p:sp>).)*<a:t>${piece}</a:t>`,
            's'
          )
        )!;
        return Number(ordonnee);
      };
      const pasEntreDeuxLignes =
        ordonneeDuTexte('Pièce 6') - ordonneeDuTexte('Pièce 5');
      expect(ordonneeDuTexte('Pièce 7') - ordonneeDuTexte('Pièce 6')).toBe(
        pasEntreDeuxLignes
      );
      expect(ordonneeDuTexte('Pièce 8') - ordonneeDuTexte('Pièce 7')).toBe(
        pasEntreDeuxLignes
      );
    });

    it('resserre les lignes et réduit le texte des pièces pour que la liste tienne au-dessus de la légende', async () => {
      const douzePieces = Array.from({ length: 12 }, (_, index) =>
        unePiece(`Pièce ${index + 1}`)
      );
      const pptx = await genereSupport({ piecesDuDossier: douzePieces });

      const commission = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
      const ordonneesDesSeparateurs = [
        ...commission.matchAll(
          /name="piece-\d+-separateur"(?:(?!<\/p:sp>).)*<a:off x="\d+" y="(\d+)"\/>/gs
        ),
      ].map(([, ordonnee]) => Number(ordonnee));
      const basDeLaHuitiemeLigneDuTemplate = 3878461 + 8 * 661987;
      expect(Math.max(...ordonneesDesSeparateurs)).toBeLessThanOrEqual(
        basDeLaHuitiemeLigneDuTemplate
      );
      const [, taillePolice] = commission.match(
        /<a:rPr [^>]*sz="(\d+)"[^>]*>(?:(?!<\/a:r>).)*<a:t>Pièce 12<\/a:t>/s
      )!;
      expect(Number(taillePolice)).toBeLessThan(1950);
    });

    it('écrit la date de création au format court, après son libellé', async () => {
      const pptx = await genereSupport();

      const couverture = await contenuSlide(pptx, 1);
      expect(couverture).toContain('<a:t>Date de création : </a:t>');
      expect(couverture).toContain('<a:t>09/11/2026</a:t>');
    });
  });
});

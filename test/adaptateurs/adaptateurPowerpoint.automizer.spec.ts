import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import { contenuSlide, nombreDeSlides } from '../aides/lecturePptx.js';

describe("L'adaptateur PowerPoint utilisant pptx-automizer", () => {
  const adaptateur = new AdaptateurPowerpointAutomizer();

  describe('quand il génère le support de commission d’homologation', () => {
    it('contient, dans l’ordre, la couverture, le sommaire et la composition de la commission', async () => {
      const pptx = await adaptateur.genereSupportCommissionHomologation({
        dateCreation: new Date(2026, 10, 9),
      });

      expect(await nombreDeSlides(pptx)).toBe(3);
      expect(await contenuSlide(pptx, 1)).toContain(
        '<a:t>Support de commission d’homologation</a:t>'
      );
      expect(await contenuSlide(pptx, 2)).toContain('<a:t>Sommaire</a:t>');
      expect(await contenuSlide(pptx, 3)).toContain(
        '<a:t>Composition de la commission et contenu du dossier</a:t>'
      );
    });

    it("écrit le nom et la fonction de l'autorité d'homologation dans la composition de la commission", async () => {
      const pptx = await adaptateur.genereSupportCommissionHomologation({
        dateCreation: new Date(2026, 10, 9),
        autorite: { nom: 'Jean Dupond', fonction: 'RSSI' },
      });

      expect(await contenuSlide(pptx, 3)).toContain(
        '<a:t>Jean Dupond, RSSI</a:t>'
      );
    });

    it("ne laisse pas l'autorité d'homologation à compléter quand elle est renseignée", async () => {
      const pptx = await adaptateur.genereSupportCommissionHomologation({
        dateCreation: new Date(2026, 10, 9),
        autorite: { nom: 'Jean Dupond', fonction: 'RSSI' },
      });

      expect(await contenuSlide(pptx, 3)).not.toContain(
        'autorite-homologation-a-completer'
      );
    });

    it("laisse l'autorité d'homologation à compléter par le projet quand elle n'est pas renseignée", async () => {
      const pptx = await adaptateur.genereSupportCommissionHomologation({
        dateCreation: new Date(2026, 10, 9),
      });

      const commission = await contenuSlide(pptx, 3);
      expect(commission).not.toContain('name="autorite-homologation"');
      expect(commission).toContain(
        'name="autorite-homologation-a-completer-texte"'
      );
    });

    it('écrit la date de création au format court, après son libellé', async () => {
      const pptx = await adaptateur.genereSupportCommissionHomologation({
        dateCreation: new Date(2026, 10, 9),
      });

      const couverture = await contenuSlide(pptx, 1);
      expect(couverture).toContain('<a:t>Date de création : </a:t>');
      expect(couverture).toContain('<a:t>09/11/2026</a:t>');
    });
  });
});

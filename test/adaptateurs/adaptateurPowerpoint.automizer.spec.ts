import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import { contenuSlide } from '../aides/lecturePptx.js';

describe("L'adaptateur PowerPoint utilisant pptx-automizer", () => {
  const adaptateur = new AdaptateurPowerpointAutomizer();

  describe('quand il génère le support de commission d’homologation', () => {
    it('écrit le nom du service sur la slide de couverture', async () => {
      const pptx = await adaptateur.genereSupportCommissionHomologation({
        nomService: 'Mon super service',
        dateCreation: new Date(2026, 10, 9),
      });

      expect(await contenuSlide(pptx, 1)).toContain(
        '<a:t>Mon super service</a:t>'
      );
    });

    it('écrit la date de création au format court, après son libellé', async () => {
      const pptx = await adaptateur.genereSupportCommissionHomologation({
        nomService: 'Mon super service',
        dateCreation: new Date(2026, 10, 9),
      });

      const couverture = await contenuSlide(pptx, 1);
      expect(couverture).toContain('<a:t>Date de création : </a:t>');
      expect(couverture).toContain('<a:t>09/11/2026</a:t>');
    });
  });
});

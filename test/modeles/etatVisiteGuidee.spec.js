import expect from 'expect.js';
import EtatVisiteGuidee from '../../src/modeles/etatVisiteGuidee.js';

describe('Le modèle état visite guidée', () => {
  describe('sur demande de finalisation de la visite guidée', () => {
    it('finalise la visite guidée', () => {
      const etatVisiteGuidee = new EtatVisiteGuidee({
        dejaTerminee: false,
      });

      etatVisiteGuidee.finalise();

      expect(etatVisiteGuidee.toJSON()).to.eql({
        dejaTerminee: true,
      });
    });
  });
});

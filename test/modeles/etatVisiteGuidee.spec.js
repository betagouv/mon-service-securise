const expect = require('expect.js');
const { creeReferentiel } = require('../../src/referentiel');
const EtatVisiteGuidee = require('../../src/modeles/etatVisiteGuidee');

describe('Le modèle état visite guidée', () => {
  describe("sur demande de finalisation d'une étape", () => {
    it("définit la nouvelle étape courante à l'étape suivante", () => {
      const referentiel = creeReferentiel({
        etapesVisiteGuidee: {
          DECRIRE: { idEtapeSuivante: 'SECURISER' },
          SECURISER: { idEtapeSuivante: 'HOMOLOGUER' },
        },
      });
      const etatVisiteGuidee = new EtatVisiteGuidee(
        { etapeCourante: 'DECRIRE' },
        referentiel
      );

      etatVisiteGuidee.termineEtape('SECURISER');

      expect(etatVisiteGuidee.etapeCourante).to.be('HOMOLOGUER');
    });

    it("finalise la visite guidée s'il n'y a pas d'étape suivante", () => {
      const referentiel = creeReferentiel({
        etapesVisiteGuidee: {
          DECRIRE: {},
        },
      });
      const etatVisiteGuidee = new EtatVisiteGuidee(
        { etapeCourante: 'DECRIRE', dejaTerminee: false },
        referentiel
      );

      etatVisiteGuidee.termineEtape('DECRIRE');

      expect(etatVisiteGuidee.etapeCourante).to.be(undefined);
      expect(etatVisiteGuidee.dejaTerminee).to.be(true);
    });
  });
});

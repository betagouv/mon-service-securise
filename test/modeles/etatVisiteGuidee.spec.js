const expect = require('expect.js');
const { creeReferentiel } = require('../../src/referentiel');
const EtatVisiteGuidee = require('../../src/modeles/etatVisiteGuidee');

describe('Le modèle état visite guidée', () => {
  describe("sur demande de finalisation d'une étape", () => {
    it("finalise la visite guidée s'il n'y a pas d'étape suivante", () => {
      const referentiel = creeReferentiel({
        etapesVisiteGuidee: {
          DECRIRE: {},
        },
      });
      const etatVisiteGuidee = new EtatVisiteGuidee(
        { dejaTerminee: false },
        referentiel
      );

      etatVisiteGuidee.termineEtape('DECRIRE');

      expect(etatVisiteGuidee.dejaTerminee).to.be(true);
    });

    describe("au moment de l'ajout de l'étape aux étapes vues", () => {
      it("ajoute l'étape aux `etapesVues`", () => {
        const referentiel = creeReferentiel({
          etapesVisiteGuidee: {
            DECRIRE: { idEtapeSuivante: 'SECURISER' },
            SECURISER: { idEtapeSuivante: 'HOMOLOGUER' },
            HOMOLOGUER: { idEtapeSuivante: 'PILOTER' },
          },
        });
        const etatVisiteGuidee = new EtatVisiteGuidee(
          { etapesVues: ['DECRIRE'] },
          referentiel
        );

        etatVisiteGuidee.termineEtape('SECURISER');

        expect(etatVisiteGuidee.etapesVues).to.eql(['DECRIRE', 'SECURISER']);
      });

      it("n'ajoute pas l'étape aux `etapesVues` si elle y figure déjà", () => {
        const referentiel = creeReferentiel({
          etapesVisiteGuidee: {
            DECRIRE: { idEtapeSuivante: 'SECURISER' },
          },
        });
        const etatVisiteGuidee = new EtatVisiteGuidee(
          { etapesVues: ['DECRIRE'] },
          referentiel
        );

        etatVisiteGuidee.termineEtape('DECRIRE');

        expect(etatVisiteGuidee.etapesVues).to.eql(['DECRIRE']);
      });

      it("reste robuste s'il n'y a pas d'`etapesVues`", () => {
        const referentiel = creeReferentiel({
          etapesVisiteGuidee: {
            DECRIRE: { idEtapeSuivante: 'SECURISER' },
          },
        });
        const etatVisiteGuidee = new EtatVisiteGuidee({}, referentiel);

        etatVisiteGuidee.termineEtape('DECRIRE');

        expect(etatVisiteGuidee.etapesVues).to.eql(['DECRIRE']);
      });
    });
  });

  describe('sur demande de finalisation de la visite guidée', () => {
    it('finalise la visite guidée', () => {
      const etatVisiteGuidee = new EtatVisiteGuidee({
        dejaTerminee: false,
        etapesVues: ['UNE_ETAPE'],
      });

      etatVisiteGuidee.finalise();

      expect(etatVisiteGuidee.toJSON()).to.eql({
        dejaTerminee: true,
      });
    });
  });

  describe("sur demande du nombre d'étapes restantes", () => {
    it("sait dire combien d'étapes sont restantes", () => {
      const referentiel = creeReferentiel({
        etapesVisiteGuidee: {
          DECRIRE: {},
          SECURISER: {},
          HOMOLOGUER: {},
        },
      });
      const etatVisiteGuidee = new EtatVisiteGuidee(
        { etapesVues: ['DECRIRE', 'SECURISER'] },
        referentiel
      );

      const resultat = etatVisiteGuidee.nombreEtapesRestantes();

      expect(resultat).to.eql(1);
    });

    it("reste robuste s'il n'y a pas d'étapes vues", () => {
      const referentiel = creeReferentiel({
        etapesVisiteGuidee: { DECRIRE: {} },
      });
      const etatVisiteGuidee = new EtatVisiteGuidee({}, referentiel);

      const resultat = etatVisiteGuidee.nombreEtapesRestantes();

      expect(resultat).to.eql(1);
    });
  });
});

const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const Mesure = require('../../src/modeles/mesure');
const Mesures = require('../../src/modeles/mesures');

describe('La liste des mesures', () => {
  describe('sur calcul du nombre de mesures mises en œuvre', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: {
        m1: { indispensable: true },
        m2: { indispensable: true },
        m3: { indispensable: true },
        m4: {},
      },
    });

    it('additionne les mesures mises en oeuvre', () => {
      const mesures = new Mesures({
        mesures: [{ id: 'm1', statut: Mesure.STATUT_FAIT }, { id: 'm2', statut: Mesure.STATUT_FAIT }],
      }, referentiel);

      expect(mesures.nbIndispensablesMisesEnOeuvre()).to.equal(2);
    });

    it('tient uniquement compte des mesures mises en œuvre', () => {
      const mesures = new Mesures({
        mesures: [{ id: 'm1', statut: Mesure.STATUT_PLANIFIE }, { id: 'm2', statut: Mesure.STATUT_NON_RETENU }],
      }, referentiel);

      expect(mesures.nbIndispensablesMisesEnOeuvre()).to.equal(0);
    });

    it('ne tient pas compte des mesures non concernees', () => {
      const mesures = new Mesures({
        mesures: [{ id: 'm1', statut: Mesure.STATUT_FAIT }, { id: 'm4', statut: Mesure.STATUT_FAIT }],
      }, referentiel);

      expect(mesures.nbIndispensablesMisesEnOeuvre()).to.equal(1);
      expect(mesures.nbRecommandeesMisesEnOeuvre()).to.equal(1);
    });
  });
});

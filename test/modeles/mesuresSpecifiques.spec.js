const expect = require('expect.js');

const InformationsHomologation = require('../../src/modeles/informationsHomologation');
const MesureSpecifique = require('../../src/modeles/mesureSpecifique');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');

const elle = it;

describe('La liste des mesures spécifiques', () => {
  elle('sait se dénombrer', () => {
    const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [] });
    expect(mesures.nombre()).to.equal(0);
  });

  elle('est composée de risques spécifiques', () => {
    const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [
      { description: 'Une mesure spécifique', modalites: 'Des modalités' },
    ] });

    expect(mesures.item(0)).to.be.a(MesureSpecifique);
  });

  describe('sur demande du statut de saisie', () => {
    elle('retourne `A_COMPLETER` si au moins une des mesures est à compléter', () => {
      const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [
        { description: 'Une mesure spécifique', modalites: 'Des modalités' },
      ] });

      expect(mesures.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
    });

    elle("retourne `COMPLETES` si aucune des mesures n'est à compléter", () => {
      const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [
      ] });

      expect(mesures.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
    });
  });
});

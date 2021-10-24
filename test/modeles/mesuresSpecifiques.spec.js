const expect = require('expect.js');

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
});

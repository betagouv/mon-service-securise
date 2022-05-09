const expect = require('expect.js');

const { A_COMPLETER } = require('../../src/modeles/informationsHomologation');
const Mesures = require('../../src/modeles/mesures');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');
const Referentiel = require('../../src/referentiel');

const elles = it;

describe('Les mesures liées à une homologation', () => {
  elles('agrègent des mesures spécifiques', () => {
    const mesures = new Mesures({ mesuresSpecifiques: [
      { description: 'Une mesure spécifique' },
    ] });

    expect(mesures.mesuresSpecifiques).to.be.a(MesuresSpecifiques);
  });

  elles('ont comme statut `A_COMPLETER` si les mesures spécifiques ont ce statut', () => {
    const mesures = new Mesures({
      mesuresGenerales: [],
      mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
    });

    expect(mesures.statutSaisie()).to.equal(A_COMPLETER);
  });

  elles('sont à completer si toutes les mesures nécessaires ne sont pas complétées', () => {
    const referentiel = Referentiel.creeReferentielVide();
    referentiel.identifiantsMesures = () => ['mesure 1', 'mesure 2'];

    const mesures = new Mesures({
      mesuresGenerales: [{ id: 'mesure 1', statut: 'fait' }],
      mesuresSpecifiques: [],
    }, referentiel);

    expect(mesures.statutSaisie()).to.equal(A_COMPLETER);
  });
});

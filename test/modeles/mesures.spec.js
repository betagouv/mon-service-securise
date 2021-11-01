const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');
const Mesures = require('../../src/modeles/mesures');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');

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

    expect(mesures.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
  });

  elles('ont le statut de saisie des mesures générales si celui des mesures spécifiques est `COMPLETES`', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { uneCategorie: 'Une catégorie' },
    });

    const mesures = new Mesures({
      mesuresGenerales: [],
      mesuresSpecifiques: [
        { description: 'Une mesure spécifique', categorie: 'uneCategorie', statut: 'fait' },
      ],
    }, referentiel);

    expect(mesures.statutSaisie()).to.equal(InformationsHomologation.A_SAISIR);
  });
});

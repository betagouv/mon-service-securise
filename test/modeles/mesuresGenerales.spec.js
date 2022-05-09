const expect = require('expect.js');

const MesuresGenerales = require('../../src/modeles/mesuresGenerales');

const { A_SAISIR, COMPLETES, A_COMPLETER } = MesuresGenerales;

describe('La liste des mesures générales', () => {
  const referentiel = { identifiantsMesures: () => ['mesure'] };

  it("est à saisir quand rien n'est saisi", () => {
    const donnees = { mesuresGenerales: [] };
    const mesuresGenerales = new MesuresGenerales(donnees);

    expect(mesuresGenerales.statutSaisie()).to.equal(A_SAISIR);
  });

  it('est complete quand les mesures sont completes', () => {
    const donnees = { mesuresGenerales: [{ id: 'mesure', statut: 'fait' }] };
    const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

    expect(mesuresGenerales.statutSaisie()).to.equal(COMPLETES);
  });

  it('est à completer quand toutes les mesures ne sont pas completes', () => {
    const donnees = { mesuresGenerales: [{ id: 'mesure' }] };
    const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

    expect(mesuresGenerales.statutSaisie()).to.equal(A_COMPLETER);
  });
});

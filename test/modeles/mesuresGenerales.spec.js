const expect = require('expect.js');

const MesuresGenerales = require('../../src/modeles/mesuresGenerales');

const { A_SAISIR, COMPLETES, A_COMPLETER } = MesuresGenerales;

describe('La liste des mesures générales', () => {
  let referentiel;

  beforeEach(() => (referentiel = {
    identifiantsCategoriesMesures: () => [],
    identifiantsMesures: () => [],
    mesures: () => ({}),
  }));

  it("est à saisir quand rien n'est saisi", () => {
    const donnees = { mesuresGenerales: [] };
    const mesuresGenerales = new MesuresGenerales(donnees);

    expect(mesuresGenerales.statutSaisie()).to.equal(A_SAISIR);
  });

  it('est complète quand les mesures sont complètes', () => {
    referentiel.identifiantsMesures = () => ['mesure'];

    const donnees = { mesuresGenerales: [{ id: 'mesure', statut: 'fait' }] };
    const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

    expect(mesuresGenerales.statutSaisie()).to.equal(COMPLETES);
  });

  it('est à compléter quand toutes les mesures ne sont pas complètes', () => {
    referentiel.identifiantsMesures = () => ['mesure'];

    const donnees = { mesuresGenerales: [{ id: 'mesure' }] };
    const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

    expect(mesuresGenerales.statutSaisie()).to.equal(A_COMPLETER);
  });

  describe('sur demande de statistiques sur les mesures', () => {
    beforeEach(() => {
      referentiel.identifiantsCategoriesMesures = () => ['une', 'deux'];
      referentiel.mesures = () => ({
        id1: { categorie: 'une' },
        id2: { categorie: 'une' },
        id3: { categorie: 'deux' },
      });
      referentiel.identifiantsMesures = () => Object.keys(referentiel.mesures());
    });

    it('fait la somme des mesures mises en oeuvre pour une catégorie donnée', () => {
      const donnees = {
        mesuresGenerales: [{ id: 'id1', statut: 'fait' }, { id: 'id2', statut: 'fait' }],
      };
      const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

      const stats = mesuresGenerales.statistiques().toJSON();
      expect(stats).to.eql({ une: { retenues: 2, misesEnOeuvre: 2 } });
    });

    it('ajoute les mesures planifiées à la somme des mesures retenues', () => {
      const donnees = {
        mesuresGenerales: [{ id: 'id1', statut: 'fait' }, { id: 'id2', statut: 'planifie' }],
      };
      const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

      const stats = mesuresGenerales.statistiques().toJSON();
      expect(stats).to.eql({ une: { retenues: 2, misesEnOeuvre: 1 } });
    });

    it('ne tient pas compte des mesures non retenues', () => {
      const donnees = {
        mesuresGenerales: [{ id: 'id1', statut: 'planifie' }, { id: 'id2', statut: 'nonRetenu' }],
      };
      const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

      const stats = mesuresGenerales.statistiques().toJSON();
      expect(stats).to.eql({ une: { retenues: 1, misesEnOeuvre: 0 } });
    });

    it('classe les statistiques par catégorie de mesure', () => {
      const donnees = {
        mesuresGenerales: [{ id: 'id1', statut: 'nonRetenu' }, { id: 'id3', statut: 'fait' }],
      };
      const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

      const stats = mesuresGenerales.statistiques().toJSON();
      expect(stats).to.eql({ deux: { retenues: 1, misesEnOeuvre: 1 } });
    });
  });
});

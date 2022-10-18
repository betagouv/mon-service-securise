const expect = require('expect.js');

const { A_COMPLETER } = require('../../src/modeles/informationsHomologation');
const Mesures = require('../../src/modeles/mesures');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');
const Referentiel = require('../../src/referentiel');

const elles = it;

describe('Les mesures liées à une homologation', () => {
  elles('comptent les mesures personnalisees', () => {
    const mesuresPersonnalisees = { uneMesure: {} };
    const mesures = new Mesures({}, Referentiel.creeReferentielVide(), mesuresPersonnalisees);

    expect(mesures.nombreMesuresPersonnalisees()).to.equal(1);
  });

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

  elles('délèguent le calcul statistique aux mesures générales', () => {
    let calculStatistiqueAppele = false;

    const mesuresRecommandees = {};
    const mesures = new Mesures({}, Referentiel.creeReferentielVide(), mesuresRecommandees);
    mesures.mesuresGenerales.statistiques = (identifiantsMesuresPersonnalisees) => {
      expect(identifiantsMesuresPersonnalisees).to.equal(mesuresRecommandees);
      calculStatistiqueAppele = true;
      return 'résultat';
    };

    const stats = mesures.statistiques();

    expect(calculStatistiqueAppele).to.be(true);
    expect(stats).to.equal('résultat');
  });

  elles("délèguent le calcul de l'indice cyber aux mesures générales", () => {
    const mesures = new Mesures({}, Referentiel.creeReferentielVide(), ['id1']);

    mesures.mesuresGenerales.statistiques = (identifiantsMesuresPersonnalisees) => {
      expect(identifiantsMesuresPersonnalisees).to.eql(['id1']);
      return { indiceCyber: () => 3.7 };
    };

    expect(mesures.indiceCyber()).to.equal(3.7);
  });

  elles('connaissent le nombre total de mesures générales', () => {
    const referentiel = Referentiel.creeReferentielVide();

    const mesures = new Mesures({
      mesuresGenerales: [],
      mesuresSpecifiques: [],
    }, referentiel, { m1: {}, m2: {} });

    expect(mesures.nombreTotalMesuresGenerales()).to.equal(2);
  });

  elles('connaissent le nombre de mesures spécifiques', () => {
    const mesures = new Mesures({
      mesuresSpecifiques: [{ description: 'Une mesure spécifique', modalites: 'Des modalités' }],
    });

    expect(mesures.nombreMesuresSpecifiques()).to.equal(1);
  });

  describe('sur une demande des mesures par statut', () => {
    let referentiel;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        mesures: {
          mesure1: {
            description: 'Mesure une',
            categorie: 'categorie1',
            indispensable: true,
          },
        },
      });
      referentiel.identifiantsCategoriesMesures = () => ['categorie1'];
    });

    elles('récupère les mesures générales triées', () => {
      const mesures = new Mesures({ mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] }, referentiel, ['mesure1']);
      mesures.mesuresGenerales.parStatut = () => ({ fait: { categorie1: [{ description: 'mesure1', indispensable: true }] } });

      expect(mesures.parStatut()).to.eql({ fait: { categorie1: [{ description: 'mesure1', indispensable: true }] } });
    });

    elles('ajoutent les mesures spécifiques', () => {
      const mesures = new Mesures({
        mesuresSpecifiques: [{ description: 'Mesure Spécifique 1', statut: 'fait', categorie: 'categorie1' }],
      },
      referentiel, ['mesure1']);
      mesures.mesuresSpecifiques.parStatut = () => ({ fait: { categorie1: [{ description: 'Mesure Spécifique 1' }] } });

      expect(mesures.parStatut()).to.eql({ fait: { categorie1: [{ description: 'Mesure Spécifique 1' }] } });
    });

    elles('fusionnent les mesures générales et spécifiques', () => {
      const mesures = new Mesures({
        mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }],
        mesuresSpecifiques: [{ description: 'Mesure Spécifique 1', statut: 'fait', categorie: 'categorie1' }],
      },
      referentiel, ['mesure1']);
      mesures.mesuresGenerales.parStatut = () => ({ fait: { categorie1: [{ description: 'mesure1', indispensable: true }] } });
      mesures.mesuresSpecifiques.parStatut = (mesuresParStatut) => {
        expect(mesuresParStatut).to.eql({ fait: { categorie1: [{ description: 'mesure1', indispensable: true }] } });
        return { fait: { categorie1: [{ description: 'mesure1', indispensable: true }, { description: 'Mesure Spécifique 1' }] } };
      };

      expect(mesures.parStatut().fait.categorie1.length).to.equal(2);
      expect(mesures.parStatut().fait.categorie1).to.eql([{ description: 'mesure1', indispensable: true }, { description: 'Mesure Spécifique 1' }]);
    });
  });
});

const expect = require('expect.js');
const {
  sauvegardeEvolutionIndiceCyber,
} = require('../../../src/bus/abonnements/sauvegardeEvolutionIndiceCyber');
const { unService } = require('../../constructeurs/constructeurService');
const Mesures = require('../../../src/modeles/mesures');
const Referentiel = require('../../../src/referentiel');

describe("L'abonnement qui sauvegarde (en base de données) l'indice cyber d'un service", () => {
  let depotDonnees;
  let referentiel;
  let mesures;

  beforeEach(() => {
    depotDonnees = {
      sauvegardeNouvelIndiceCyber: async () => {},
      lisDernierIndiceCyber: async () => undefined,
    };
    referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: {} },
      statutsMesures: { fait: {}, enCours: {} },
      mesures: { mesureA: {} },
      indiceCyber: { noteMax: 5 },
    });
    mesures = new Mesures(
      { mesuresGenerales: [{ id: 'mesureA', statut: 'fait' }] },
      referentiel,
      {
        mesureA: { categorie: 'gouvernance' },
        mesureB: { categorie: 'gouvernance' },
      }
    );
  });

  it("lève une exception s'il ne reçoit pas le service", async () => {
    try {
      await sauvegardeEvolutionIndiceCyber({
        depotDonnees,
      })({ service: undefined });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de sauvegarder l'indice cyber d'un service sans avoir ce service en paramètre."
      );
    }
  });

  it("enregistre l'indice cyber si aucune valeur n'existe", async () => {
    let donneesRecues = {};
    depotDonnees.sauvegardeNouvelIndiceCyber = async (donnees) => {
      donneesRecues = donnees;
    };
    depotDonnees.lisDerniereActiviteIndiceCyber = async () => undefined;

    await sauvegardeEvolutionIndiceCyber({ depotDonnees })({
      service: unService().avecId('123').avecMesures(mesures).construis(),
    });

    expect(donneesRecues).to.eql({
      idService: '123',
      indiceCyber: {
        gouvernance: 2.5,
        total: 2.5,
      },
      indiceCyberPersonnalise: {
        gouvernance: 2.5,
        total: 2.5,
      },
      mesuresParStatut: {
        enCours: 0,
        fait: 1,
        sansStatut: 1,
      },
    });
  });

  describe('si une valeur existe déjà', () => {
    it("n'enregistre pas si l'indice cyber ET l'indice cyber personnalisé sont les mêmes", async () => {
      let enregistrementAppele = false;
      let idServiceRecu;
      depotDonnees.lisDernierIndiceCyber = async (idService) => {
        idServiceRecu = idService;
        return {
          indiceCyber: {
            total: 2.5,
          },
          indiceCyberPersonnalise: {
            total: 2.5,
          },
        };
      };
      depotDonnees.sauvegardeNouvelIndiceCyber = async () => {
        enregistrementAppele = true;
      };

      await sauvegardeEvolutionIndiceCyber({ depotDonnees })({
        service: unService().avecId('123').avecMesures(mesures).construis(),
      });

      expect(idServiceRecu).to.be('123');
      expect(enregistrementAppele).to.be(false);
    });

    it("enregistre si l'indice cyber est différent", async () => {
      let enregistrementAppele = false;
      depotDonnees.lisDernierIndiceCyber = async () => ({
        indiceCyber: {
          total: 2.0,
        },
        indiceCyberPersonnalise: {
          total: 2.5,
        },
      });
      depotDonnees.sauvegardeNouvelIndiceCyber = async () => {
        enregistrementAppele = true;
      };

      await sauvegardeEvolutionIndiceCyber({ depotDonnees })({
        service: unService().avecId('123').avecMesures(mesures).construis(),
      });

      expect(enregistrementAppele).to.be(true);
    });

    it("enregistre si l'indice cyber personnalisé est différent", async () => {
      let enregistrementAppele = false;
      depotDonnees.lisDernierIndiceCyber = async () => ({
        indiceCyber: {
          total: 2.5,
        },
        indiceCyberPersonnalise: {
          total: 2.0,
        },
      });
      depotDonnees.sauvegardeNouvelIndiceCyber = async () => {
        enregistrementAppele = true;
      };

      await sauvegardeEvolutionIndiceCyber({ depotDonnees })({
        service: unService().avecId('123').avecMesures(mesures).construis(),
      });

      expect(enregistrementAppele).to.be(true);
    });
  });
});

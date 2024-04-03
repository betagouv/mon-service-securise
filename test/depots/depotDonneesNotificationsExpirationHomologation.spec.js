const expect = require('expect.js');
const {
  creeDepot,
} = require('../../src/depots/depotDonneesNotificationsExpirationHomologation');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const NotificationExpirationHomologation = require('../../src/modeles/notificationExpirationHomologation');
const adaptateurUUIDParDefaut = require('../../src/adaptateurs/adaptateurUUID');

describe("Le dépôt de données des notifications d'expiration d'homologation", () => {
  let adaptateurPersistance;
  let adaptateurUUID;
  let depot;

  beforeEach(() => {
    adaptateurPersistance = unePersistanceMemoire().construis();
    adaptateurUUID = adaptateurUUIDParDefaut;
    depot = creeDepot({ adaptateurPersistance, adaptateurUUID });
  });

  it("délègue à l'adaptateur de persistance la suppression des notifications pour un service", async () => {
    let idServiceAppele;
    adaptateurPersistance.supprimeNotificationsExpirationHomologationPourService =
      async (idService) => {
        idServiceAppele = idService;
      };

    await depot.supprimeNotificationsExpirationHomologationPourService('123');

    expect(idServiceAppele).to.be('123');
  });

  it("délègue à l'adaptateur de persistance la suppression des notifications par identifiants", async () => {
    let idsPasses;
    adaptateurPersistance.supprimeNotificationsExpirationHomologation = async (
      ids
    ) => {
      idsPasses = ids;
    };

    await depot.supprimeNotificationsExpirationHomologation([1, 2]);

    expect(idsPasses).to.eql([1, 2]);
  });

  describe('sur demande de sauvegarde de notifications', () => {
    it('utilise un adaptateur de chiffrement pour générer des UUID', async () => {
      let donneesPassees;
      adaptateurUUID.genereUUID = () => 'NOUVEL_ID';
      adaptateurPersistance.sauvegardeNotificationsExpirationHomologation =
        async (notifications) => {
          donneesPassees = notifications;
        };

      await depot.sauvegardeNotificationsExpirationHomologation([
        new NotificationExpirationHomologation({
          idService: '123',
        }),
      ]);

      expect(donneesPassees[0].id).to.be('NOUVEL_ID');
    });

    it("délègue à l'adaptateur de persistance la sauvegarde des notifications", async () => {
      let donneesPassees;
      adaptateurPersistance.sauvegardeNotificationsExpirationHomologation =
        async (notifications) => {
          donneesPassees = notifications;
        };

      await depot.sauvegardeNotificationsExpirationHomologation([
        new NotificationExpirationHomologation({
          idService: '123',
        }),
      ]);

      expect(donneesPassees.length).to.be(1);
      expect(donneesPassees[0].idService).to.be('123');
    });

    it("n'appelle pas l'adaptateur de persistance si il n'y a pas de notifications", async () => {
      let adaptateurAppele = false;
      adaptateurPersistance.sauvegardeNotificationsExpirationHomologation =
        async () => {
          adaptateurAppele = true;
        };

      await depot.sauvegardeNotificationsExpirationHomologation([]);

      expect(adaptateurAppele).to.be(false);
    });
  });

  describe('sur demande de lecture des notifications en date', () => {
    it("passe à l'adaptateur de persistance les dates du jour et du lendemain en tant que bornes", async () => {
      let donneesRecues;
      adaptateurPersistance.lisNotificationsExpirationHomologationDansIntervalle =
        async (debut, fin) => {
          donneesRecues = { debut, fin };
          return [];
        };

      await depot.lisNotificationsExpirationHomologationEnDate(
        new Date('2024-01-25T00:00:00Z')
      );

      expect(donneesRecues).to.eql({
        debut: '2024-01-25T00:00:00.000Z',
        fin: '2024-01-26T00:00:00.000Z',
      });
    });

    it('retourne les notifications', async () => {
      adaptateurPersistance.lisNotificationsExpirationHomologationDansIntervalle =
        async () => [
          {
            id: 'un ID',
            idService: 'un ID de service',
          },
        ];

      const notifications =
        await depot.lisNotificationsExpirationHomologationEnDate(
          new Date('2024-01-01T00:00:00Z')
        );

      expect(notifications[0]).to.be.an(NotificationExpirationHomologation);
      expect(notifications[0].id).to.be('un ID');
      expect(notifications[0].idService).to.be('un ID de service');
    });
  });
});

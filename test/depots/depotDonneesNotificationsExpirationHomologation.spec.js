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
});

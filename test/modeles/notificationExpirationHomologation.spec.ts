const expect = require('expect.js');

const NotificationExpirationHomologation = require('../../src/modeles/notificationExpirationHomologation');
const Referentiel = require('../../src/referentiel');
const { unDossier } = require('../constructeurs/constructeurDossier');

describe("Une notification d'expiration d'homologation", () => {
  it("peut s'instancier avec un ID de service, une date de prochain envoi et un délai d'expiration", () => {
    const uneNotification = new NotificationExpirationHomologation({
      idService: '123',
      dateProchainEnvoi: new Date('2024-01-01'),
      delaiAvantExpirationMois: 6,
    });

    expect(uneNotification.idService).to.be('123');
    expect(uneNotification.dateProchainEnvoi).to.eql(new Date('2024-01-01'));
    expect(uneNotification.delaiAvantExpirationMois).to.be(6);
  });

  describe("sur demande des notifications pour un dossier d'homologation", () => {
    it('sait renvoyer une liste des notifications qui seront à envoyer pour un dossier donné', () => {
      const referentiel = Referentiel.creeReferentiel({
        echeancesRenouvellement: {
          unAn: { nbMoisDecalage: 12, rappelsExpirationMois: [1] },
        },
        statutsAvisDossierHomologation: { favorable: {} },
      });

      const debutePremierJanvierEtValideUnAn = unDossier(referentiel)
        .quiEstComplet()
        .quiEstActif()
        .avecDecision('2024-01-01', 'unAn')
        .construit();

      const notifications = NotificationExpirationHomologation.pourUnDossier({
        idService: '123',
        dossier: debutePremierJanvierEtValideUnAn,
        referentiel,
      });

      expect(notifications.length).to.be(2);
      expect(notifications[0]).to.eql({
        idService: '123',
        dateProchainEnvoi: new Date('2024-12-01T00:00:00Z'),
        delaiAvantExpirationMois: 1,
      });
      expect(notifications[1]).to.eql({
        idService: '123',
        dateProchainEnvoi: new Date('2025-01-01T00:00:00Z'),
        delaiAvantExpirationMois: 0,
      });
    });
  });

  it('connait les données à persister', () => {
    const uneNotification = new NotificationExpirationHomologation({
      idService: '123',
      dateProchainEnvoi: new Date('2024-01-01'),
      delaiAvantExpirationMois: 6,
    });

    expect(uneNotification.donneesAPersister()).to.eql({
      idService: '123',
      dateProchainEnvoi: new Date('2024-01-01'),
      delaiAvantExpirationMois: 6,
    });
  });
});

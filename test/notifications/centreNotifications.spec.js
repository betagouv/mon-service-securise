const expect = require('expect.js');
const CentreNotifications = require('../../src/notifications/centreNotifications');
const Referentiel = require('../../src/referentiel');

describe('Le centre de notifications', () => {
  it("jette une erreur s'il n'est pas instancié avec les bonnes dépendances", () => {
    expect(() => new CentreNotifications({})).to.throwError((e) => {
      expect(e.message).to.be(
        "Impossible d'instancier le centre de notifications sans ses dépendances"
      );
    });
  });

  describe('sur demande des notifications', () => {
    it("retourne les nouveautés, dans l'ordre antéchronologique", () => {
      const referentiel = Referentiel.creeReferentiel({
        nouvellesFonctionnalites: [
          { id: 'N1', dateDeDeploiement: '2024-01-01' },
          { id: 'N2', dateDeDeploiement: '2024-02-02' },
        ],
      });

      const centreNotifications = new CentreNotifications({ referentiel });

      const notifications = centreNotifications.toutesNotifications();

      expect(notifications.length).to.be(2);
      expect(notifications[0].id).to.be('N2');
    });
  });
});

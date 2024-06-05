const expect = require('expect.js');
const CentreNotifications = require('../../src/notifications/centreNotifications');
const Referentiel = require('../../src/referentiel');
const { creeDepot } = require('../../src/depotDonnees');
const { ErreurIdentifiantNouveauteInconnu } = require('../../src/erreurs');

describe('Le centre de notifications', () => {
  let referentiel;
  let depotDonnees;

  beforeEach(() => {
    referentiel = Referentiel.creeReferentiel({
      nouvellesFonctionnalites: [
        { id: 'N1', dateDeDeploiement: '2024-01-01' },
        { id: 'N2', dateDeDeploiement: '2024-02-02' },
      ],
    });
    depotDonnees = creeDepot();
  });

  it("jette une erreur s'il n'est pas instancié avec les bonnes dépendances", () => {
    expect(() => new CentreNotifications({})).to.throwError((e) => {
      expect(e.message).to.be(
        "Impossible d'instancier le centre de notifications sans ses dépendances"
      );
    });
  });

  describe('sur demande des notifications', () => {
    it("retourne les nouveautés, dans l'ordre antéchronologique", async () => {
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
      });

      const notifications = await centreNotifications.toutesNotifications('U1');

      expect(notifications.length).to.be(2);
      expect(notifications[0].id).to.be('N2');
    });

    it("ajoute le statut 'lu' à la notification si elle l'est", async () => {
      let donneesRecues;
      depotDonnees.nouveautesPourUtilisateur = async (idUtilisateur) => {
        donneesRecues = { idUtilisateur };
        return ['N2'];
      };
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
      });

      const notifications = await centreNotifications.toutesNotifications('U1');

      expect(donneesRecues.idUtilisateur).to.be('U1');

      expect(notifications[0].id).to.be('N2');
      expect(notifications[0].statutLecture).to.be('lue');
      expect(notifications[1].id).to.be('N1');
      expect(notifications[1].statutLecture).to.be('nonLue');
    });
  });

  describe('sur marquage de nouveauté lue', () => {
    it("jette une erreur si l'identifiant de nouveauté n'est pas présent dans le référentiel", async () => {
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
      });

      try {
        await centreNotifications.marqueNouveauteLue(
          'idUtilisateur',
          'ID_NOUVEAUTE_INCONNU'
        );
        expect().fail("L'appel aurait dû lever une exception.");
      } catch (e) {
        expect(e).to.be.an(ErreurIdentifiantNouveauteInconnu);
      }
    });

    it("délègue au dépôt de données le marquage à 'lu' de la nouveauté", async () => {
      let donneesRecues;
      depotDonnees.marqueNouveauteLue = async (idUtilisateur, idNouveaute) => {
        donneesRecues = { idUtilisateur, idNouveaute };
      };
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
      });

      await centreNotifications.marqueNouveauteLue('U1', 'N1');

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.idNouveaute).to.be('N1');
    });
  });
});

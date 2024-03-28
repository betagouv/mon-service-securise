const expect = require('expect.js');
const {
  sauvegardeNotificationsExpirationHomologation,
} = require('../../../src/bus/abonnements/sauvegardeNotificationsExpirationHomologation');
const Referentiel = require('../../../src/referentiel');
const { unDossier } = require('../../constructeurs/constructeurDossier');

describe("L'abonnement qui sauvegarde (en base de données) les notifications d'expiration d'une homologation", () => {
  let depotDonnees;
  let referentiel;
  let adaptateurHorloge;

  beforeEach(() => {
    adaptateurHorloge = {
      maintenant: () => new Date('2024-01-01'),
    };
    depotDonnees = {
      sauvegardeNotificationsExpirationHomologation: async () => {},
      supprimeNotificationsExpirationHomologationPourService: async () => {},
    };
    referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: {
        unAn: { nbMoisDecalage: 12, rappelsExpirationMois: [1] },
      },
      statutsAvisDossierHomologation: { favorable: {} },
    });
  });

  [
    { propriete: 'idService', nom: "l'ID du service" },
    { propriete: 'dossier', nom: 'le dossier' },
  ].forEach(({ propriete, nom }) => {
    const donnees = {
      idService: '123',
      dossier: {},
    };
    it(`lève une exception s'il ne reçoit pas ${nom}`, async () => {
      try {
        delete donnees[propriete];
        await sauvegardeNotificationsExpirationHomologation({
          adaptateurHorloge,
          depotDonnees,
          referentiel,
        })(donnees);
        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          `Impossible de sauvegarder les notifications d'expiration d'un dossier d'homologation sans avoir ${nom} en paramètre.`
        );
      }
    });
  });

  it('demande au dépôt de supprimer les notifications existantes pour ce service', async () => {
    let depotAppele = false;
    depotDonnees.supprimeNotificationsExpirationHomologationPourService =
      async () => {
        depotAppele = true;
      };

    await sauvegardeNotificationsExpirationHomologation({
      adaptateurHorloge,
      depotDonnees,
      referentiel,
    })({
      idService: '123',
      dossier: unDossier(referentiel).quiEstComplet().construit(),
    });

    expect(depotAppele).to.be(true);
  });

  it('passe des NotificationsExpirationHomologation au dépôt de données', async () => {
    let notificationsRecus = [];
    depotDonnees.sauvegardeNotificationsExpirationHomologation = async (
      notifications
    ) => {
      notificationsRecus = notifications;
    };

    await sauvegardeNotificationsExpirationHomologation({
      adaptateurHorloge,
      depotDonnees,
      referentiel,
    })({
      idService: '123',
      dossier: unDossier(referentiel)
        .quiEstComplet()
        .avecDecision('2024-01-01', 'unAn')
        .construit(),
    });

    expect(notificationsRecus.length).to.be(2);
    expect(notificationsRecus[0].idService).to.be('123');
  });

  it('filtre les notifications qui sont dans le passé', async () => {
    let notificationsRecus = [];
    depotDonnees.sauvegardeNotificationsExpirationHomologation = async (
      notifications
    ) => {
      notificationsRecus = notifications;
    };

    await sauvegardeNotificationsExpirationHomologation({
      adaptateurHorloge,
      depotDonnees,
      referentiel,
    })({
      idService: '123',
      dossier: unDossier(referentiel)
        .quiEstComplet()
        .avecDecision('2023-01-02', 'unAn')
        .construit(),
    });

    expect(notificationsRecus.length).to.be(1);
  });
});

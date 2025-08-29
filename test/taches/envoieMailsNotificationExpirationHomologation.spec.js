const expect = require('expect.js');
const {
  envoieMailsNotificationExpirationHomologation,
} = require('../../src/taches/envoieMailsNotificationExpirationHomologation');
const { depotVide } = require('../depots/depotVide');
const {
  fabriqueAdaptateurHorloge,
} = require('../../src/adaptateurs/adaptateurHorloge');
const { creeDepot } = require('../../src/depotDonnees');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const {
  uneAutorisation,
} = require('../constructeurs/constructeurAutorisation');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');
const Autorisation = require('../../src/modeles/autorisations/autorisation');

const { DROITS_VOIR_STATUT_HOMOLOGATION } = Autorisation;

describe("La tâche d'envoie des emails de notifications d'expiration d'homologation", () => {
  let depotDonnees;
  let adaptateurHorloge;
  let adaptateurMail;

  beforeEach(async () => {
    adaptateurHorloge = fabriqueAdaptateurHorloge();
    adaptateurMail = {
      envoieNotificationExpirationHomologation: () => {},
    };
    depotDonnees = await depotVide();
  });

  it("lit les notifications du jour via le dépôt de données, en utilisant l'adaptateur Horloge pour obtenir la date du jour", async () => {
    let dateRecue;
    depotDonnees.lisNotificationsExpirationHomologationEnDate = async (
      date
    ) => {
      dateRecue = date;
      return [];
    };
    adaptateurHorloge.maintenant = () => new Date('2024-01-01');

    await envoieMailsNotificationExpirationHomologation({
      depotDonnees,
      adaptateurHorloge,
      adaptateurMail,
    });

    expect(dateRecue).to.eql(new Date('2024-01-01'));
  });

  it("utilise l'adaptateur de mail pour envoyer la notification", async () => {
    let notificationEnvoyee;
    adaptateurMail.envoieNotificationExpirationHomologation = (
      destinataire,
      idService,
      delai
    ) => {
      notificationEnvoyee = { destinataire, idService, delai };
    };
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('U1', 'S1').donnees
      )
      .ajouteUnUtilisateur(
        unUtilisateur().avecId('U1').avecEmail('jean.dujardin@beta.gouv.fr')
          .donnees
      )
      .ajouteUneNotificationExpirationHomologation({
        id: 'N1',
        idService: 'S1',
        delaiAvantExpirationMois: 6,
        dateProchainEnvoi: new Date('2024-01-01T00:00:00.000Z'),
      })
      .construis();
    depotDonnees = creeDepot({
      adaptateurPersistance,
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
    });
    adaptateurHorloge = { maintenant: () => new Date('2024-01-01') };

    await envoieMailsNotificationExpirationHomologation({
      depotDonnees,
      adaptateurHorloge,
      adaptateurMail,
    });

    expect(notificationEnvoyee).to.eql({
      destinataire: 'jean.dujardin@beta.gouv.fr',
      idService: 'S1',
      delai: 6,
    });
  });

  it('envoi la notification à tous les contributeurs du service', async () => {
    const destinataires = [];
    adaptateurMail.envoieNotificationExpirationHomologation = (
      destinataire,
      idService,
      delai
    ) => {
      if (idService === 'S1' && delai === 6) {
        destinataires.push(destinataire);
      }
    };
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('U1', 'S1').donnees
      )
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('U2', 'S1').donnees
      )
      .ajouteUneAutorisation(
        uneAutorisation()
          .deContributeur('U3', 'S1')
          .avecDroits(DROITS_VOIR_STATUT_HOMOLOGATION).donnees
      )
      .ajouteUnUtilisateur(
        unUtilisateur().avecId('U1').avecEmail('jean.1@beta.gouv.fr').donnees
      )
      .ajouteUnUtilisateur(
        unUtilisateur().avecId('U2').avecEmail('jean.2@beta.gouv.fr').donnees
      )
      .ajouteUnUtilisateur(
        unUtilisateur().avecId('U3').avecEmail('jean.3@beta.gouv.fr').donnees
      )
      .ajouteUneNotificationExpirationHomologation({
        id: 'N1',
        idService: 'S1',
        delaiAvantExpirationMois: 6,
        dateProchainEnvoi: new Date('2024-01-01T00:00:00.000Z'),
      })
      .construis();
    depotDonnees = creeDepot({
      adaptateurPersistance,
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
    });
    adaptateurHorloge = { maintenant: () => new Date('2024-01-01') };

    await envoieMailsNotificationExpirationHomologation({
      depotDonnees,
      adaptateurHorloge,
      adaptateurMail,
    });

    expect(destinataires).to.eql([
      'jean.1@beta.gouv.fr',
      'jean.2@beta.gouv.fr',
      'jean.3@beta.gouv.fr',
    ]);
  });

  it("n'envoie pas la notification aux contributeurs n'ayant pas les droits de lecture sur HOMOLOGUER pour le service", async () => {
    const destinataires = [];
    adaptateurMail.envoieNotificationExpirationHomologation = (
      destinataire,
      idService,
      delai
    ) => {
      if (idService === 'S1' && delai === 6) {
        destinataires.push(destinataire);
      }
    };
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUneAutorisation(
        uneAutorisation().deContributeur('U1', 'S1').avecDroits({}).donnees
      )
      .ajouteUnUtilisateur(
        unUtilisateur().avecId('U1').avecEmail('jean.1@beta.gouv.fr').donnees
      )
      .ajouteUneNotificationExpirationHomologation({
        id: 'N1',
        idService: 'S1',
        delaiAvantExpirationMois: 6,
        dateProchainEnvoi: new Date('2024-01-01T00:00:00.000Z'),
      })
      .construis();
    depotDonnees = creeDepot({
      adaptateurPersistance,
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
    });
    adaptateurHorloge = { maintenant: () => new Date('2024-01-01') };

    await envoieMailsNotificationExpirationHomologation({
      depotDonnees,
      adaptateurHorloge,
      adaptateurMail,
    });

    expect(destinataires.length).to.be(0);
  });

  it('utilise le dépôt de données pour supprimer les notifications après envoi', async () => {
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('U1', 'S1').donnees
      )
      .ajouteUnUtilisateur(
        unUtilisateur().avecId('U1').avecEmail('jean.dujardin@beta.gouv.fr')
          .donnees
      )
      .construis();
    depotDonnees = creeDepot({
      adaptateurPersistance,
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
    });

    const idsPasses = [];
    depotDonnees.supprimeNotificationsExpirationHomologation = async (ids) => {
      idsPasses.push(...ids);
    };
    depotDonnees.lisNotificationsExpirationHomologationEnDate = async () => [
      { id: 1, idService: 'S1' },
      { id: 2, idService: 'S1' },
    ];

    await envoieMailsNotificationExpirationHomologation({
      depotDonnees,
      adaptateurHorloge,
      adaptateurMail,
    });

    expect(idsPasses).to.eql([1, 2]);
  });

  it("retourne un rapport d'exécution", async () => {
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('U1', 'S1').donnees
      )
      .ajouteUnUtilisateur(
        unUtilisateur().avecId('U1').avecEmail('jean.dujardin@beta.gouv.fr')
          .donnees
      )
      .construis();
    depotDonnees = creeDepot({
      adaptateurPersistance,
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
    });

    depotDonnees.lisNotificationsExpirationHomologationEnDate = async () => [
      { id: 1, idService: 'S1' },
      { id: 2, idService: 'ServiceQuiNexistePas' },
    ];

    const resultat = await envoieMailsNotificationExpirationHomologation({
      depotDonnees,
      adaptateurHorloge,
      adaptateurMail,
    });

    expect(resultat).to.eql({
      nbNotificationsEnvoyees: 1,
      nbEchecs: 1,
    });
  });
});

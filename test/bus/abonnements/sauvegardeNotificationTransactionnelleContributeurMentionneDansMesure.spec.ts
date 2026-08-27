import ActiviteMesure, {
  DonneesActiviteMesure,
} from '../../../src/modeles/activiteMesure.ts';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import { sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure } from '../../../src/bus/abonnements/sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure.ts';
import { DepotDonneesNotificationsTransactionnelles } from '../../../src/depots/depotDonneesNotificationsTransactionnelles.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import { unePersistanceMemoireTS } from '../../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';

describe("L'abonné qui sauvegarde les notifications transactionnelles d'un contributeur mentionné dans une mesure", () => {
  let depotDonnees: DepotDonneesNotificationsTransactionnelles;
  let idDestinataire: UUID;
  const dateCommentaire = new Date();

  const uneActivite = (surcharge?: Partial<DonneesActiviteMesure>) =>
    new ActiviteMesure({
      type: 'ajoutCommentaire',
      idMesure: 'M1',
      idActeur: unUUID('U1'),
      idService: unUUID('S1'),
      typeMesure: 'generale',
      details: { contenu: `Je mentionne @[${idDestinataire}]` },
      date: dateCommentaire,
      ...surcharge,
    });

  beforeEach(() => {
    const adaptateurPersistanceTS = unePersistanceMemoireTS().construis();
    depotDonnees = new DepotDonneesNotificationsTransactionnelles({
      adaptateurPersistanceTS,
    });
    idDestinataire = unUUIDRandom();
  });

  it('sauvegarde la notification transactionnelle via le dépôt', async () => {
    const unCommentaire = new ActiviteMesure({
      type: 'ajoutCommentaire',
      idMesure: 'M1',
      idActeur: unUUID('U1'),
      idService: unUUID('S1'),
      typeMesure: 'generale',
      details: { contenu: `Je mentionne @[${idDestinataire}]` },
      date: dateCommentaire,
    });

    await sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure(
      { depotDonnees }
    )({ activiteMesure: unCommentaire });

    const notifications = await depotDonnees.lisNotifications(idDestinataire);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].donnees()).toEqual({
      id: expect.any(String),
      lue: false,
      idActeur: unUUID('U1'),
      idDestinataire,
      metadonnees: {
        idService: unUUID('S1'),
        idMesure: 'M1',
        typeMesure: 'generale',
      },
      date: dateCommentaire,
      type: 'mentionDansMesure',
    });
  });

  it('ignore un contributeur qui se mentionne lui même', async () => {
    const unCommentaire = uneActivite({
      idActeur: idDestinataire,
    });

    await sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure(
      { depotDonnees }
    )({ activiteMesure: unCommentaire });

    const notifications = await depotDonnees.lisNotifications(idDestinataire);
    expect(notifications).toHaveLength(0);
  });

  it("ignore une activité qui n'est pas un commentaire", async () => {
    const unCommentaire = uneActivite({
      type: 'ajoutEcheance',
    });

    await sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure(
      { depotDonnees }
    )({ activiteMesure: unCommentaire });

    const notifications = await depotDonnees.lisNotifications(idDestinataire);
    expect(notifications).toHaveLength(0);
  });

  it('ignore un commentaire sans mention', async () => {
    const unCommentaire = uneActivite({
      details: { contenu: 'Je ne mentionne pas' },
    });

    await sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure(
      { depotDonnees }
    )({ activiteMesure: unCommentaire });

    const notifications = await depotDonnees.lisNotifications(idDestinataire);
    expect(notifications).toHaveLength(0);
  });

  it('crée une notif par personne notifiée dans le commentaire', async () => {
    const idDestinataire1 = unUUIDRandom();
    const idDestinataire2 = unUUIDRandom();
    const unCommentaire = uneActivite({
      details: {
        contenu: `Je mentionne @[${idDestinataire1}] et @[${idDestinataire2}]`,
      },
    });

    await sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure(
      { depotDonnees }
    )({ activiteMesure: unCommentaire });

    const notifications1 = await depotDonnees.lisNotifications(idDestinataire1);
    expect(notifications1).toHaveLength(1);
    const notifications2 = await depotDonnees.lisNotifications(idDestinataire2);
    expect(notifications2).toHaveLength(1);
  });

  it('ne crée pas plusieurs notifs si mentionné deux fois dans le commentaire', async () => {
    const unCommentaire = uneActivite({
      details: {
        contenu: `Je mentionne @[${idDestinataire}] et @[${idDestinataire}]`,
      },
    });

    await sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure(
      { depotDonnees }
    )({ activiteMesure: unCommentaire });

    const notifications1 = await depotDonnees.lisNotifications(idDestinataire);
    expect(notifications1).toHaveLength(1);
  });
});

import ActiviteMesure from '../../../src/modeles/activiteMesure.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure } from '../../../src/bus/abonnements/sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure.ts';
import { unePersistanceMemoireTS } from '../../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import {
  creeDepot,
  DepotDonneesNotificationsTransactionnelles,
} from '../../../src/depots/depotDonneesNotificationsTransactionnelles.ts';

describe("L'abonné qui sauvegarde les notifications transactionnelles d'un contributeur mentionné dans une mesure", () => {
  let depotDonnees: DepotDonneesNotificationsTransactionnelles;

  beforeEach(() => {
    const adaptateurPersistance = unePersistanceMemoireTS().construis();
    depotDonnees = creeDepot({ adaptateurPersistance });
  });

  it('sauvegarde la notification transactionnelle via le dépôt', async () => {
    const idDestinataire = unUUID('U2');
    const unCommentaire = new ActiviteMesure({
      type: 'ajoutCommentaire',
      idMesure: 'M1',
      idActeur: unUUID('U1'),
      idService: unUUID('S1'),
      typeMesure: 'generale',
      details: { contenu: `Je mentionne @[${idDestinataire}]` },
      date: new Date(),
    });

    await sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure(
      { depotDonnees }
    )({ activiteMesure: unCommentaire });

    const notifications = await depotDonnees.lisNotifications(idDestinataire);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toEqual({
      idActeur: unUUID('U1'),
    });
  });

  it.skip('ignore un contributeur qui se mentionne lui même');
  it.skip("ignore une activité qui n'est pas un commentaire");
  it.skip('ignore un commentaire sans mention');
  it.skip('crée une notif par personne notifiée dans le commentaire');
});

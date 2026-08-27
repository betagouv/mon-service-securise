import { TousReferentiels } from '../../../src/referentiel.interface.ts';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { creeDepot } from '../../../src/depotDonnees.ts';
import * as adaptateurEnvironnement from '../../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import fauxAdaptateurRechercheEntreprise from '../../mocks/adaptateurRechercheEntreprise.js';
import { fabriqueBusPourLesTests } from '../../bus/aides/busPourLesTests.js';
import BusEvenements from '../../../src/bus/busEvenements.js';
import * as Referentiel from '../../../src/referentiel.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { SourceNotificationsTransactionnelles } from '../../../src/notifications/sources/sourceNotificationsTransactionnelles.ts';
import { NotificationTransactionnelle } from '../../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';

describe('Les notifications de nouveautés', () => {
  let referentiel: TousReferentiels;
  let depotDonnees: DepotDonnees;

  const unReferentiel = (donnees: Record<string, unknown>) =>
    // @ts-expect-error On force des valeurs de test
    Referentiel.creeReferentiel(donnees);

  beforeEach(() => {
    depotDonnees = creeDepot({
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });
    referentiel = unReferentiel({});
  });

  const laSource = () =>
    new SourceNotificationsTransactionnelles(referentiel, depotDonnees);

  describe("concernant les notifications 'mentionDansMesure'", () => {
    const idUtilisateur = unUUID('U1');
    const dateNotif = new Date();
    const idService = unUUID('S1');
    const notificationTransactionnelle = NotificationTransactionnelle.nouveau({
      idActeur: unUUID('A'),
      idDestinataire: idUtilisateur,
      type: 'mentionDansMesure',
      date: dateNotif,
      metadonnees: { idService, idMesure: 'RECENSEMENT.1' },
    });

    beforeEach(async () => {
      await depotDonnees.sauvegardeNotificationTransactionnelle(
        notificationTransactionnelle
      );
    });

    it("mets en forme la notification 'mentionDansMesure'", async () => {
      const notifications = await laSource().notificationsPour(idUtilisateur);

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        id: notificationTransactionnelle.donnees().id,
        type: 'activite',
        titre: 'Mention',
        sousTitre: expect.any(String),
        titreCta: 'Voir le commentaire',
        lien: expect.any(String),
        canalDiffusion: 'centreNotifications',
        statutLecture: 'nonLue',
        doitNotifierLecture: true,
        horodatage: dateNotif,
        date: expect.any(Function),
      });
    });

    it('met en forme le lien', async () => {
      const notifications = await laSource().notificationsPour(idUtilisateur);

      expect(notifications[0].lien).toBe(
        `/service/${idService}/mesures?idMesure=RECENSEMENT.1&onglet=activite`
      );
    });
  });

  // 'Acteur vous a mentionné sur la mesure « mesure » de [service]'
});

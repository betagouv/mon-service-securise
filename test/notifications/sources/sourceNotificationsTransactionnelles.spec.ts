import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { creeDepot } from '../../../src/depotDonnees.ts';
import * as adaptateurEnvironnement from '../../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import fauxAdaptateurRechercheEntreprise from '../../mocks/adaptateurRechercheEntreprise.js';
import { fabriqueBusPourLesTests } from '../../bus/aides/busPourLesTests.js';
import BusEvenements from '../../../src/bus/busEvenements.js';
import { unUUID } from '../../constructeurs/UUID.ts';
import { SourceNotificationsTransactionnelles } from '../../../src/notifications/sources/sourceNotificationsTransactionnelles.ts';
import { NotificationTransactionnelle } from '../../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';

describe('Les notifications de nouveautés', () => {
  let depotDonnees: DepotDonnees;

  beforeEach(() => {
    depotDonnees = creeDepot({
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });
  });

  const laSource = () => new SourceNotificationsTransactionnelles(depotDonnees);

  describe("concernant les notifications 'mentionDansMesure'", () => {
    const idUtilisateur = unUUID('U1');
    const dateNotif = new Date();
    const idService = unUUID('S1');
    const idActeur = unUUID('A');
    const notificationTransactionnelle = NotificationTransactionnelle.nouveau({
      idActeur,
      idDestinataire: idUtilisateur,
      type: 'mentionDansMesure',
      date: dateNotif,
      metadonnees: { idService, idMesure: 'RECENSEMENT.1' },
    });

    beforeEach(async () => {
      await depotDonnees.sauvegardeNotificationTransactionnelle(
        notificationTransactionnelle
      );

      depotDonnees.services = async () => [
        unServiceV2()
          .avecNomService('Mairie de Bordeaux')
          .avecId(idService)
          .ajouteUnContributeur(
            unUtilisateur().avecId(idActeur).quiSAppelle('Jean Acteur').donnees
          )
          .construis(),
      ];
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

    it('met en forme le sous-titre', async () => {
      const notifications = await laSource().notificationsPour(idUtilisateur);

      expect(notifications[0].sousTitre).toBe(
        "Jean Acteur vous a mentionné sur la mesure « Etablir la liste de l'ensemble des services et données à protéger » de [Mairie de Bordeaux]"
      );
    });
  });

  it.skip("n'inclue pas une notif si je n'ai plus accès au service");
  it.skip("masque le nom d'un admin");
  it.skip('fonctionne pour des mesures spécifiques');
  // Déplacer les templates de notifs dans le referentiel
});

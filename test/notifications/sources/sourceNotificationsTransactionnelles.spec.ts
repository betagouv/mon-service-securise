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
import Mesures from '../../../src/modeles/mesures.js';
import { IdNotificationTransactionnelle } from '../../../src/referentiel.types.ts';

describe('Les notifications transactionnelles', () => {
  let depotDonnees: DepotDonnees;
  const idUtilisateur = unUUID('U1');
  const dateNotif = new Date();
  const idService = unUUID('S1');
  const idActeur = unUUID('A');

  beforeEach(() => {
    depotDonnees = creeDepot({
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });

    depotDonnees.services = async () => [
      unServiceV2()
        .avecNomService('Mairie de Bordeaux')
        .avecId(idService)
        .ajouteUnContributeur(
          unUtilisateur().avecId(idActeur).quiSAppelle('Jean Acteur').donnees
        )
        .avecMesures(
          new Mesures(
            {
              mesuresGenerales: [
                { id: 'RECENSEMENT.1', statut: 'fait', echeance: '2026-01-01' },
              ],
              mesuresSpecifiques: [
                {
                  id: unUUID('M'),
                  statut: 'fait',
                  description: 'Spécifique',
                  echeance: '2026-02-02',
                },
              ],
            },
            // @ts-expect-error il infère sur du js un référentiel v1
            creeReferentielV2(),
            {
              'RECENSEMENT.1': { categorie: 'gouvernance' },
            }
          )
        )
        .construis(),
    ];
  });

  const laSource = () =>
    new SourceNotificationsTransactionnelles(depotDonnees, {
      maintenant: () => new Date(),
    });

  const notificationMesureGenerale = (type: IdNotificationTransactionnelle) =>
    NotificationTransactionnelle.nouveau({
      idActeur,
      idDestinataire: idUtilisateur,
      type,
      date: dateNotif,
      metadonnees: {
        idService,
        idMesure: 'RECENSEMENT.1',
        typeMesure: 'generale',
      },
    });

  const notificationMesureSpecifique = (type: IdNotificationTransactionnelle) =>
    NotificationTransactionnelle.nouveau({
      idActeur,
      idDestinataire: idUtilisateur,
      type,
      date: dateNotif,
      metadonnees: {
        idService,
        idMesure: unUUID('M'),
        typeMesure: 'specifique',
      },
    });

  describe("concernant les notifications 'mentionDansMesure'", () => {
    describe('pour une notification dans une mesure générale', async () => {
      beforeEach(async () => {
        await depotDonnees.sauvegardeNotificationTransactionnelle(
          notificationMesureGenerale('mentionDansMesure')
        );
      });

      it("mets en forme la notification 'mentionDansMesure'", async () => {
        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications).toHaveLength(1);
        expect(notifications[0]).toEqual({
          id: expect.any(String),
          type: 'activite',
          titre: 'Mention',
          sousTitre: expect.any(String),
          titreCta: 'Voir le commentaire',
          lien: expect.any(String),
          canalDiffusion: 'centreNotifications',
          statutLecture: 'nonLue',
          doitNotifierLecture: true,
          supprimable: true,
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

      it("n'inclue pas une notif si je n'ai plus accès au service", async () => {
        depotDonnees.services = async () => [];

        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications).toHaveLength(0);
      });

      it("masque le nom d'un admin", async () => {
        depotDonnees.services = async () => [
          unServiceV2()
            .avecNomService('Mairie de Bordeaux')
            .avecId(idService)
            .ajouteUnContributeur({
              ...unUtilisateur().avecId(idActeur).quiSAppelle('Jean Acteur')
                .donnees,
              estAdmin: true,
            })
            .construis(),
        ];

        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications[0].sousTitre).toBe(
          "Un administrateur vous a mentionné sur la mesure « Etablir la liste de l'ensemble des services et données à protéger » de [Mairie de Bordeaux]"
        );
      });
    });

    describe('pour une notification dans une mesure spécifique', async () => {
      beforeEach(async () => {
        await depotDonnees.sauvegardeNotificationTransactionnelle(
          notificationMesureSpecifique('mentionDansMesure')
        );
      });

      it('met en forme le sous-titre', async () => {
        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications[0].sousTitre).toBe(
          'Jean Acteur vous a mentionné sur la mesure « Spécifique » de [Mairie de Bordeaux]'
        );
      });
    });
  });

  describe("concernant les notifications 'responsableMesure'", () => {
    describe('pour une notification dans une mesure générale', async () => {
      beforeEach(async () => {
        await depotDonnees.sauvegardeNotificationTransactionnelle(
          notificationMesureGenerale('responsableMesure')
        );
      });

      it('mets en forme la notification', async () => {
        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications).toHaveLength(1);
        expect(notifications[0]).toEqual({
          id: expect.any(String),
          type: 'activite',
          titre: 'Nouvelle responsabilitié',
          sousTitre: expect.any(String),
          titreCta: 'Voir la mesure',
          lien: expect.any(String),
          canalDiffusion: 'centreNotifications',
          statutLecture: 'nonLue',
          doitNotifierLecture: true,
          supprimable: true,
          horodatage: dateNotif,
          date: expect.any(Function),
        });
      });

      it('met en forme le lien', async () => {
        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications[0].lien).toBe(
          `/service/${idService}/mesures?idMesure=RECENSEMENT.1`
        );
      });

      it('met en forme le sous-titre', async () => {
        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications[0].sousTitre).toBe(
          "Vous êtes responsable de « Etablir la liste de l'ensemble des services et données à protéger » sur [Mairie de Bordeaux]"
        );
      });

      it("n'inclue pas une notif si je n'ai plus accès au service", async () => {
        depotDonnees.services = async () => [];

        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications).toHaveLength(0);
      });
    });

    describe('pour une notification de mention dans une mesure spécifique', async () => {
      beforeEach(async () => {
        await depotDonnees.sauvegardeNotificationTransactionnelle(
          notificationMesureSpecifique('responsableMesure')
        );
      });

      it('met en forme le sous-titre', async () => {
        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications[0].sousTitre).toBe(
          'Vous êtes responsable de « Spécifique » sur [Mairie de Bordeaux]'
        );
      });
    });
  });

  describe("concernant les notifications 'echeanceMesureBientotExpiree'", () => {
    describe('pour une notification dans une mesure générale', async () => {
      beforeEach(async () => {
        await depotDonnees.sauvegardeNotificationTransactionnelle(
          notificationMesureGenerale('echeanceMesureBientotExpiree')
        );
      });

      it('mets en forme la notification', async () => {
        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications).toHaveLength(1);
        expect(notifications[0]).toEqual({
          id: expect.any(String),
          type: 'echeanceProche',
          titre: 'Échéance dans 2 semaines',
          sousTitre: expect.any(String),
          titreCta: 'Mettre à jour',
          lien: expect.any(String),
          canalDiffusion: 'centreNotifications',
          statutLecture: 'nonLue',
          doitNotifierLecture: true,
          supprimable: true,
          horodatage: dateNotif,
          date: expect.any(Function),
        });
      });

      it('met en forme le lien', async () => {
        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications[0].lien).toBe(
          `/service/${idService}/mesures?idMesure=RECENSEMENT.1`
        );
      });

      it('met en forme le sous-titre', async () => {
        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications[0].sousTitre).toBe(
          "« Etablir la liste de l'ensemble des services et données à protéger » arrive à échéance le 01/01/2026 sur [Mairie de Bordeaux]"
        );
      });

      it("n'inclue pas une notif si je n'ai plus accès au service", async () => {
        depotDonnees.services = async () => [];

        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications).toHaveLength(0);
      });
    });

    describe('pour une notification de mention dans une mesure spécifique', async () => {
      beforeEach(async () => {
        await depotDonnees.sauvegardeNotificationTransactionnelle(
          notificationMesureSpecifique('echeanceMesureBientotExpiree')
        );
      });

      it('met en forme le sous-titre', async () => {
        const notifications = await laSource().notificationsPour(idUtilisateur);

        expect(notifications[0].sousTitre).toBe(
          '« Spécifique » arrive à échéance le 02/02/2026 sur [Mairie de Bordeaux]'
        );
      });
    });
  });

  it('filtre les notifications du futur', async () => {
    const notification = NotificationTransactionnelle.nouveau({
      ...notificationMesureGenerale('mentionDansMesure').donnees(),
      date: new Date('3600-01-01'),
    });
    await depotDonnees.sauvegardeNotificationTransactionnelle(notification);

    const notifications = await laSource().notificationsPour(idUtilisateur);

    expect(notifications).toHaveLength(0);
  });
});

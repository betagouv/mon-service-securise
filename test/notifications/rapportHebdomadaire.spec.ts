import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import {
  DonneesNotificationTransactionnelle,
  NotificationTransactionnelle,
} from '../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { RapportHebdomadaire } from '../../src/notifications/rapportHebdomadaire.ts';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import BusEvenements from '../../src/bus/busEvenements.js';
import { creeDepot } from '../../src/depotDonnees.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../src/referentielV2.ts';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import { PersistanceTS } from '../../src/adaptateurs/persistanceTS.interface.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { IdNotificationTransactionnelle } from '../../src/referentiel.types.ts';

describe('Le service de rapport hebdomadaire', () => {
  const idDestinataire = unUUID('D');
  const hier = new Date();
  hier.setDate(hier.getDate() - 1);
  const busEvenements = fabriqueBusPourLesTests() as unknown as BusEvenements;
  let rapportHebdomadaire: RapportHebdomadaire;
  let adaptateurPersistanceTS: PersistanceTS;
  let adaptateurPersistance: AdaptateurPersistance;
  let depotDonnees: DepotDonnees;

  const leDepot = () =>
    creeDepot({
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
      adaptateurPersistance,
      adaptateurPersistanceTS,
      busEvenements,
    });

  const uneNotification = (
    donnees?: Partial<DonneesNotificationTransactionnelle>
  ) =>
    NotificationTransactionnelle.nouveau({
      idActeur: unUUID('A'),
      idDestinataire,
      type: 'mentionDansMesure',
      metadonnees: {
        idMesure: 'M1',
        idService: unUUID('S'),
        typeMesure: 'generale',
      },
      date: hier,
      ...donnees,
    });

  describe.each([
    {
      type: 'mentionDansMesure',
      messageSingulier:
        'Vous avez reçu <b>une mention</b> dans un commentaire.',
      messagePluriel: 'Vous avez reçu <b>2 mentions</b> dans des commentaires.',
    },
    {
      type: 'responsableMesure',
      messageSingulier: "Vous êtes désormais responsable d'<b>une mesure</b>.",
      messagePluriel: 'Vous êtes désormais responsable de <b>2 mesures</b>.',
    },
    {
      type: 'echeanceMesureBientotExpiree',
      messageSingulier:
        '<b>Une mesure</b> arrive à échéance dans les deux prochaines semaines.',
      messagePluriel:
        '<b>2 mesures</b> arrivent à échéance dans les deux prochaines semaines.',
    },
  ] as Array<{
    type: IdNotificationTransactionnelle;
    messageSingulier: string;
    messagePluriel: string;
  }>)(
    "concernant le message de contenu à envoyer pour une notification '$type'",
    ({ type, messageSingulier, messagePluriel }) => {
      beforeEach(() => {
        const notification = uneNotification({
          type,
        }).donnees();
        adaptateurPersistanceTS = unePersistanceMemoireTS()
          .ajouteNotificationTransactionnelle(notification)
          .construis();
        adaptateurPersistance = unePersistanceMemoire()
          .ajouteUnUtilisateur(
            unUtilisateur()
              .avecId(unUUID('D'))
              .avecEmail('jeanne.dujardin@beta.gouv.fr').donnees
          )
          .construis() as unknown as AdaptateurPersistance;
        depotDonnees = leDepot();

        rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });
      });

      it("ne conserve pas les notifications pour lesquelles l'utilisateur ne souhaite pas recevoir d'email", async () => {
        adaptateurPersistanceTS = unePersistanceMemoireTS()
          .ajouteNotificationTransactionnelle(
            uneNotification({
              idDestinataire: unUUID('U'),
              type,
            }).donnees()
          )
          .construis();
        adaptateurPersistance = unePersistanceMemoire()
          .ajouteUnUtilisateur(
            unUtilisateur()
              .avecId(unUUID('U'))
              .avecEmail('jean.valjean@mail.fr')
              .avecPreferencesRapportHebdomadaire({ [type]: false }).donnees
          )
          .construis() as unknown as AdaptateurPersistance;
        depotDonnees = leDepot();
        rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

        const donnees = await rapportHebdomadaire.donnees();

        expect(donnees).toEqual({});
      });

      it('met en forme le message au singulier', async () => {
        const donnees = await rapportHebdomadaire.donnees();

        expect(donnees).toEqual({
          'jeanne.dujardin@beta.gouv.fr': messageSingulier,
        });
      });

      it('gère le pluriel', async () => {
        adaptateurPersistanceTS = unePersistanceMemoireTS()
          .ajouteNotificationTransactionnelle(
            uneNotification({ type }).donnees()
          )
          .ajouteNotificationTransactionnelle(
            uneNotification({ type }).donnees()
          )
          .construis();
        depotDonnees = leDepot();
        rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

        const donnees = await rapportHebdomadaire.donnees();

        expect(donnees).toEqual({
          'jeanne.dujardin@beta.gouv.fr': messagePluriel,
        });
      });

      it("reste robuste s'il n'y a pas de notification de ce type", async () => {
        adaptateurPersistanceTS = unePersistanceMemoireTS().construis();
        depotDonnees = leDepot();
        rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

        const donnees = await rapportHebdomadaire.donnees();

        expect(donnees).toEqual({});
      });

      it("retourne l'email de l'utilisateur concerné", async () => {
        adaptateurPersistanceTS = unePersistanceMemoireTS()
          .ajouteNotificationTransactionnelle(
            uneNotification({
              idDestinataire: unUUID('U'),
              type,
            }).donnees()
          )
          .construis();
        adaptateurPersistance = unePersistanceMemoire()
          .ajouteUnUtilisateur(
            unUtilisateur()
              .avecId(unUUID('U'))
              .avecEmail('jean.valjean@mail.fr').donnees
          )
          .construis() as unknown as AdaptateurPersistance;
        depotDonnees = leDepot();
        rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

        const donnees = await rapportHebdomadaire.donnees();

        expect(donnees).toEqual({
          'jean.valjean@mail.fr': messageSingulier,
        });
      });

      it("reste robuste si l'utilisateur est introuvable", async () => {
        adaptateurPersistanceTS = unePersistanceMemoireTS()
          .ajouteNotificationTransactionnelle(
            uneNotification({ idDestinataire: unUUID('X'), type }).donnees()
          )
          .construis();
        depotDonnees = leDepot();
        rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

        const donnees = await rapportHebdomadaire.donnees();

        expect(donnees).toEqual({});
      });
    }
  );

  it('aggrège tous les messages', async () => {
    adaptateurPersistanceTS = unePersistanceMemoireTS()
      .ajouteNotificationTransactionnelle(
        uneNotification({ type: 'mentionDansMesure' }).donnees()
      )
      .ajouteNotificationTransactionnelle(
        uneNotification({ type: 'responsableMesure' }).donnees()
      )
      .ajouteNotificationTransactionnelle(
        uneNotification({ type: 'echeanceMesureBientotExpiree' }).donnees()
      )
      .construis();
    depotDonnees = leDepot();
    rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

    const donnees = await rapportHebdomadaire.donnees();

    expect(donnees).toEqual({
      'jeanne.dujardin@beta.gouv.fr':
        "Vous avez reçu <b>une mention</b> dans un commentaire.<br>Vous êtes désormais responsable d'<b>une mesure</b>.<br><b>Une mesure</b> arrive à échéance dans les deux prochaines semaines.",
    });
  });

  it("n'envoie rien si l'utilisateur a désactivé toutes les préférences", async () => {
    adaptateurPersistanceTS = unePersistanceMemoireTS()
      .ajouteNotificationTransactionnelle(
        uneNotification({
          idDestinataire: unUUID('U'),
          type: 'responsableMesure',
        }).donnees()
      )
      .ajouteNotificationTransactionnelle(
        uneNotification({
          idDestinataire: unUUID('U'),
          type: 'mentionDansMesure',
        }).donnees()
      )
      .ajouteNotificationTransactionnelle(
        uneNotification({
          idDestinataire: unUUID('U'),
          type: 'echeanceMesureBientotExpiree',
        }).donnees()
      )
      .construis();
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnUtilisateur(
        unUtilisateur()
          .avecId(unUUID('U'))
          .avecEmail('jean.valjean@mail.fr')
          .avecPreferencesRapportHebdomadaire({
            responsableMesure: false,
            mentionDansMesure: false,
            echeanceMesureBientotExpiree: false,
          }).donnees
      )
      .construis() as unknown as AdaptateurPersistance;
    depotDonnees = leDepot();
    rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

    const donnees = await rapportHebdomadaire.donnees();

    expect(donnees).toEqual({});
  });
});

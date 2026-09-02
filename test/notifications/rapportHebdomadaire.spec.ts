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
      metadonnees: {},
      date: hier,
      ...donnees,
    });

  beforeEach(() => {
    const notification = uneNotification().donnees();
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
        uneNotification({ idDestinataire: unUUID('U') }).donnees()
      )
      .construis();
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnUtilisateur(
        unUtilisateur()
          .avecId(unUUID('U'))
          .avecEmail('jean.valjean@mail.fr')
          .avecPreferencesRapportHebdomadaire({ mentionDansMesure: false })
          .donnees
      )
      .construis() as unknown as AdaptateurPersistance;
    depotDonnees = leDepot();
    rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

    const donnees = await rapportHebdomadaire.donnees();

    expect(donnees).toEqual({});
  });

  describe('concernant le message de contenu à envoyer', () => {
    it('met en forme le nombre de mentions dans des mesures', async () => {
      const donnees = await rapportHebdomadaire.donnees();

      expect(donnees).toEqual({
        'jeanne.dujardin@beta.gouv.fr':
          'Vous avez reçu 1 mention dans un commentaire.',
      });
    });

    it('gère le pluriel', async () => {
      adaptateurPersistanceTS = unePersistanceMemoireTS()
        .ajouteNotificationTransactionnelle(uneNotification().donnees())
        .ajouteNotificationTransactionnelle(uneNotification().donnees())
        .construis();
      depotDonnees = leDepot();
      rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

      const donnees = await rapportHebdomadaire.donnees();

      expect(donnees).toEqual({
        'jeanne.dujardin@beta.gouv.fr':
          'Vous avez reçu 2 mentions dans des commentaires.',
      });
    });

    it("reste robuste s'il n'y a pas de type de notification", async () => {
      adaptateurPersistanceTS = unePersistanceMemoireTS().construis();
      depotDonnees = leDepot();
      rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

      const donnees = await rapportHebdomadaire.donnees();

      expect(donnees).toEqual({});
    });

    it("retourne l'email de l'utilisateur concerné", async () => {
      adaptateurPersistanceTS = unePersistanceMemoireTS()
        .ajouteNotificationTransactionnelle(
          uneNotification({ idDestinataire: unUUID('U') }).donnees()
        )
        .construis();
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(
          unUtilisateur().avecId(unUUID('U')).avecEmail('jean.valjean@mail.fr')
            .donnees
        )
        .construis() as unknown as AdaptateurPersistance;
      depotDonnees = leDepot();
      rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

      const donnees = await rapportHebdomadaire.donnees();

      expect(donnees).toEqual({
        'jean.valjean@mail.fr': 'Vous avez reçu 1 mention dans un commentaire.',
      });
    });

    it("reste robuste si l'utilisateur est introuvable", async () => {
      adaptateurPersistanceTS = unePersistanceMemoireTS()
        .ajouteNotificationTransactionnelle(
          uneNotification({ idDestinataire: unUUID('X') }).donnees()
        )
        .construis();
      depotDonnees = leDepot();
      rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });

      const donnees = await rapportHebdomadaire.donnees();

      expect(donnees).toEqual({});
    });
  });
});

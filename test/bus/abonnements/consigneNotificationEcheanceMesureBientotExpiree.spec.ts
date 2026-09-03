import { unService } from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { uneMesureGenerale } from '../../constructeurs/constructeurMesureGenerale.js';
import { creeDepot as creeDepotComplet } from '../../../src/depotDonnees.ts';
import * as adaptateurEnvironnement from '../../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import fauxAdaptateurRechercheEntreprise from '../../mocks/adaptateurRechercheEntreprise.js';
import fauxAdaptateurChiffrement from '../../mocks/adaptateurChiffrement.js';
import { fabriqueBusPourLesTests } from '../aides/busPourLesTests.js';
import BusEvenements from '../../../src/bus/busEvenements.js';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { unePersistanceMemoire } from '../../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { AdaptateurPersistance } from '../../../src/adaptateurs/adaptateurPersistance.interface.ts';
import Mesure from '../../../src/modeles/mesure.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { consigneNotificationEcheanceMesureBientotExpiree } from '../../../src/bus/abonnements/consigneNotificationEcheanceMesureBientotExpiree.ts';
import { NotificationTransactionnelle } from '../../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';

describe("L'abonnement qui consigne les notifications d'échéance de mesure bientôt expirée", () => {
  let abonnement: ReturnType<
    typeof consigneNotificationEcheanceMesureBientotExpiree
  >;
  let depotDonnees: DepotDonnees;
  const idActeur = unUUID('A');
  const idUtilisateurNomme = unUUID('U');
  const idProprietaire1 = unUUID('P1');
  const idProprietaire2 = unUUID('P2');
  const idService = unUUID('S');

  beforeEach(() => {
    depotDonnees = creeDepotComplet({
      adaptateurPersistance:
        unePersistanceMemoire().construis() as AdaptateurPersistance,
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });
    abonnement = consigneNotificationEcheanceMesureBientotExpiree({
      depotDonnees,
    });
  });

  it('renvoie une fonction', () => {
    expect(typeof abonnement).toBe('function');
  });

  const creeEvenement = ({
    ancienneMesure,
    nouvelleMesure,
    typeMesure = 'generale',
  }: {
    ancienneMesure: Mesure;
    nouvelleMesure: Mesure;
    typeMesure?: 'generale' | 'specifique';
  }) => ({
    service: unService()
      .avecId(unUUID('S'))
      .ajouteUnContributeur({ id: idProprietaire1, estProprietaire: true })
      .ajouteUnContributeur({ id: idProprietaire2, estProprietaire: true })
      .construis(),
    utilisateur: unUtilisateur().avecId(idActeur).construis(),
    ancienneMesure,
    nouvelleMesure,
    typeMesure,
  });

  it("ne consigne pas si la mesure n'a pas changé", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale().construis(),
      nouvelleMesure: uneMesureGenerale().construis(),
    });

    await abonnement(evenement);

    const notifications =
      await depotDonnees.lisNotifications(idUtilisateurNomme);
    expect(notifications).toHaveLength(0);
  });

  describe('quand une échéance est ajoutée', () => {
    it('notifie les responsables 2 semaines avant', async () => {
      const evenement = creeEvenement({
        ancienneMesure: uneMesureGenerale()
          .avecId('MG1')
          .sansEcheance()
          .avecResponsable(idUtilisateurNomme)
          .construis(),
        nouvelleMesure: uneMesureGenerale()
          .avecId('MG1')
          .avecEcheance('2026-09-01T00:00:00.000Z')
          .avecResponsable(idUtilisateurNomme)
          .construis(),
      });

      await abonnement(evenement);

      const notifications =
        await depotDonnees.lisNotifications(idUtilisateurNomme);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].donnees()).toEqual({
        id: expect.any(String),
        lue: false,
        idActeur,
        idDestinataire: idUtilisateurNomme,
        metadonnees: {
          idMesure: 'MG1',
          idService,
          typeMesure: 'generale',
        },
        type: 'echeanceMesureBientotExpiree',
        date: new Date('2026-08-18T00:00:00.000Z'),
      });
    });

    it("notifie les propriétaires s'il n'y a pas de responsables", async () => {
      const evenement = creeEvenement({
        ancienneMesure: uneMesureGenerale()
          .avecId('MG1')
          .sansEcheance()
          .sansResponsable()
          .construis(),
        nouvelleMesure: uneMesureGenerale()
          .avecId('MG1')
          .avecEcheance('2026-09-01T00:00:00.000Z')
          .sansResponsable()
          .construis(),
      });

      await abonnement(evenement);

      expect(await depotDonnees.lisNotifications(idProprietaire1)).toHaveLength(
        1
      );
      expect(await depotDonnees.lisNotifications(idProprietaire2)).toHaveLength(
        1
      );
    });
  });

  describe('quand une échéance est supprimée', () => {
    it('supprime les notifications pour les responsables', async () => {
      await depotDonnees.sauvegardeNotificationTransactionnelle(
        NotificationTransactionnelle.nouveau({
          date: new Date(),
          type: 'echeanceMesureBientotExpiree',
          idActeur,
          idDestinataire: idUtilisateurNomme,
          metadonnees: {
            idMesure: 'MG1',
            idService,
            typeMesure: 'generale',
          },
        })
      );

      const evenement = creeEvenement({
        ancienneMesure: uneMesureGenerale()
          .avecId('MG1')
          .avecEcheance('2026-09-01T00:00:00.000Z')
          .avecResponsable(idUtilisateurNomme)
          .construis(),
        nouvelleMesure: uneMesureGenerale()
          .avecId('MG1')
          .sansEcheance()
          .avecResponsable(idUtilisateurNomme)
          .construis(),
      });

      await abonnement(evenement);

      const notifications =
        await depotDonnees.lisNotifications(idUtilisateurNomme);
      expect(notifications).toHaveLength(0);
    });

    it("supprime les notifications pour les propriétaires s'il n'y a pas de responsables", async () => {
      await depotDonnees.sauvegardeNotificationTransactionnelle(
        NotificationTransactionnelle.nouveau({
          date: new Date(),
          type: 'echeanceMesureBientotExpiree',
          idActeur,
          idDestinataire: idProprietaire1,
          metadonnees: {
            idMesure: 'MG1',
            idService,
            typeMesure: 'generale',
          },
        })
      );

      const evenement = creeEvenement({
        ancienneMesure: uneMesureGenerale()
          .avecId('MG1')
          .avecEcheance('2026-09-01T00:00:00.000Z')
          .sansResponsable()
          .construis(),
        nouvelleMesure: uneMesureGenerale()
          .avecId('MG1')
          .sansEcheance()
          .sansResponsable()
          .construis(),
      });

      await abonnement(evenement);

      expect(await depotDonnees.lisNotifications(idProprietaire1)).toHaveLength(
        0
      );
    });
  });

  describe('quand une échéance est modifiée', () => {
    it('supprime les notifications des responsables pour en créer des nouvelles', async () => {
      await depotDonnees.sauvegardeNotificationTransactionnelle(
        NotificationTransactionnelle.nouveau({
          date: new Date(),
          type: 'echeanceMesureBientotExpiree',
          idActeur,
          idDestinataire: idUtilisateurNomme,
          metadonnees: {
            idMesure: 'MG1',
            idService,
            typeMesure: 'generale',
          },
        })
      );

      const evenement = creeEvenement({
        ancienneMesure: uneMesureGenerale()
          .avecId('MG1')
          .avecEcheance('2026-08-01T00:00:00.000Z')
          .avecResponsable(idUtilisateurNomme)
          .construis(),
        nouvelleMesure: uneMesureGenerale()
          .avecId('MG1')
          .avecEcheance('2026-09-01T00:00:00.000Z')
          .avecResponsable(idUtilisateurNomme)
          .construis(),
      });

      await abonnement(evenement);

      const notifications =
        await depotDonnees.lisNotifications(idUtilisateurNomme);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].donnees()).toEqual({
        id: expect.any(String),
        lue: false,
        idActeur,
        idDestinataire: idUtilisateurNomme,
        metadonnees: {
          idMesure: 'MG1',
          idService,
          typeMesure: 'generale',
        },
        type: 'echeanceMesureBientotExpiree',
        date: new Date('2026-08-18T00:00:00.000Z'),
      });
    });

    it("supprime les notifications des propriétaires pour en créer des nouvelles s'il n'y a pas de responsables", async () => {
      await depotDonnees.sauvegardeNotificationTransactionnelle(
        NotificationTransactionnelle.nouveau({
          date: new Date(),
          type: 'echeanceMesureBientotExpiree',
          idActeur,
          idDestinataire: idProprietaire1,
          metadonnees: {
            idMesure: 'MG1',
            idService,
            typeMesure: 'generale',
          },
        })
      );

      const evenement = creeEvenement({
        ancienneMesure: uneMesureGenerale()
          .avecId('MG1')
          .avecEcheance('2026-08-01T00:00:00.000Z')
          .sansResponsable()
          .construis(),
        nouvelleMesure: uneMesureGenerale()
          .avecId('MG1')
          .avecEcheance('2026-09-01T00:00:00.000Z')
          .sansResponsable()
          .construis(),
      });

      await abonnement(evenement);

      const notifications =
        await depotDonnees.lisNotifications(idProprietaire1);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].donnees().date).toEqual(
        new Date('2026-08-18T00:00:00.000Z')
      );
    });
  });
});

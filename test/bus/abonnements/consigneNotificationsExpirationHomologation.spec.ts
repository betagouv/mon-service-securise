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
import { unUUID } from '../../constructeurs/UUID.ts';
import { consigneNotificationsExpirationHomologation } from '../../../src/bus/abonnements/consigneNotificationsExpirationHomologation.ts';
import { unDossier } from '../../constructeurs/constructeurDossier.ts';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { VersionService } from '../../../src/modeles/versionService.ts';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { NotificationTransactionnelle } from '../../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

describe("L'abonnement qui consigne les notifications d'expiration d'homologation", () => {
  let abonnement: ReturnType<
    typeof consigneNotificationsExpirationHomologation
  >;
  let depotDonnees: DepotDonnees;
  const idProprietaire1 = unUUID('P1');
  const idProprietaire2 = unUUID('P2');
  const idService = unUUID('S');

  beforeEach(() => {
    depotDonnees = creeDepotComplet({
      adaptateurPersistance: unePersistanceMemoire()
        .ajouteUnService(
          unServiceV2().avecId(idService).donnees,
          VersionService.v2
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire(idProprietaire1, idService).donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire(idProprietaire2, idService).donnees
        )
        .ajouteUnUtilisateur(unUtilisateur().avecId(idProprietaire1).donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId(idProprietaire2).donnees)
        .construis() as AdaptateurPersistance,
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });
    abonnement = consigneNotificationsExpirationHomologation({
      depotDonnees,
    });
  });

  it('renvoie une fonction', () => {
    expect(typeof abonnement).toBe('function');
  });

  it("notifie les propriétaires de l'`homologationExpiree` à la date de prochaine homologation", async () => {
    const evenement = {
      dossier: unDossier(creeReferentielV2())
        .quiEstComplet()
        .avecDecision('2025-01-01', 'unAn')
        .construis(),
      idService,
    };

    await abonnement(evenement);

    const notificationsP1 =
      await depotDonnees.lisNotifications(idProprietaire1);
    expect(notificationsP1).toHaveLength(1);
    expect(notificationsP1[0].donnees()).toEqual({
      id: expect.any(String),
      lue: false,
      idActeur: idProprietaire1,
      idDestinataire: idProprietaire1,
      metadonnees: {
        idService,
      },
      type: 'homologationExpiree',
      date: new Date('2026-01-01'),
    });
    const notificationsP2 =
      await depotDonnees.lisNotifications(idProprietaire2);
    expect(notificationsP2).toHaveLength(1);
    expect(notificationsP2[0].donnees()).toEqual({
      id: expect.any(String),
      lue: false,
      idActeur: idProprietaire2,
      idDestinataire: idProprietaire2,
      metadonnees: {
        idService,
      },
      type: 'homologationExpiree',
      date: new Date('2026-01-01'),
    });
  });

  it('supprime les notifications concernant les anciennes homologations', async () => {
    await depotDonnees.sauvegardeNotificationTransactionnelle(
      NotificationTransactionnelle.nouveau({
        date: new Date(),
        type: 'homologationExpiree',
        idActeur: idProprietaire1,
        idDestinataire: idProprietaire1,
        metadonnees: { idService },
      })
    );

    const evenement = {
      dossier: unDossier(creeReferentielV2())
        .quiEstComplet()
        .avecDecision('2025-01-01', 'unAn')
        .construis(),
      idService,
    };

    await abonnement(evenement);

    const notificationsP1 =
      await depotDonnees.lisNotifications(idProprietaire1);
    expect(notificationsP1).toHaveLength(1);
  });
});

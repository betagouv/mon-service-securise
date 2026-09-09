import { creeDepot as creeDepotComplet } from '../../../src/depotDonnees.js';
import * as adaptateurEnvironnement from '../../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../../src/referentielV2.js';
import fauxAdaptateurRechercheEntreprise from '../../mocks/adaptateurRechercheEntreprise.js';
import fauxAdaptateurChiffrement from '../../mocks/adaptateurChiffrement.js';
import { fabriqueBusPourLesTests } from '../aides/busPourLesTests.js';
import BusEvenements from '../../../src/bus/busEvenements.js';
import { DepotDonnees } from '../../../src/depotDonnees.interface.js';
import { unePersistanceMemoire } from '../../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { AdaptateurPersistance } from '../../../src/adaptateurs/adaptateurPersistance.interface.js';
import { unUUID } from '../../constructeurs/UUID.js';
import { consigneNotificationInvitationsServices } from '../../../src/bus/abonnements/consigneNotificationInvitationsServices.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';

describe("L'abonnement qui consigne les notifications d'échéance de mesure bientôt expirée", () => {
  let abonnement: ReturnType<typeof consigneNotificationInvitationsServices>;
  let depotDonnees: DepotDonnees;
  const idActeur = unUUID('A');
  const idDestinataire = unUUID('U');
  const idService1 = unUUID('S1');
  const idService2 = unUUID('S2');

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
    abonnement = consigneNotificationInvitationsServices({
      depotDonnees,
    });
  });

  it('renvoie une fonction', () => {
    expect(typeof abonnement).toBe('function');
  });

  it('consigne une notification pour chaque service ciblé', async () => {
    await abonnement({
      acteur: unUtilisateur().avecId(idActeur).construis(),
      destinataire: unUtilisateur().avecId(idDestinataire).construis(),
      services: [
        unServiceV2().avecId(idService1).construis(),
        unServiceV2().avecId(idService2).construis(),
      ],
    });

    const notifications = await depotDonnees.lisNotifications(idDestinataire);

    expect(notifications).toHaveLength(2);
    expect(notifications[0].donnees()).toEqual({
      id: expect.any(String),
      lue: false,
      idActeur,
      idDestinataire,
      metadonnees: {
        idService: idService1,
      },
      type: 'invitationService',
      date: expect.any(Date),
    });
    expect(notifications[1].donnees()).toEqual({
      id: expect.any(String),
      lue: false,
      idActeur,
      idDestinataire,
      metadonnees: {
        idService: idService2,
      },
      type: 'invitationService',
      date: expect.any(Date),
    });
  });
});

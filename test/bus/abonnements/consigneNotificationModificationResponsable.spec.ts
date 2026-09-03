import { unService } from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { uneMesureGenerale } from '../../constructeurs/constructeurMesureGenerale.js';
import { consigneNotificationModificationResponsable } from '../../../src/bus/abonnements/consigneNotificationModificationResponsable.ts';
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
import { NotificationTransactionnelle } from '../../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';
import EvenementMesureServiceModifiee from '../../../src/bus/evenementMesureServiceModifiee.js';

describe("L'abonnement qui consigne les notifications de modifications de responsable", () => {
  let abonnement: ReturnType<
    typeof consigneNotificationModificationResponsable
  >;
  let depotDonnees: DepotDonnees;
  const idActeur = unUUID('A');
  const idUtilisateurNomme = unUUID('U');

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
    abonnement = consigneNotificationModificationResponsable({ depotDonnees });
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
    service: unService().avecId('S1').construis(),
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

  it("crée une notification lorsqu'un responsable est ajouté", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale()
        .avecId('MG1')
        .sansResponsable()
        .construis(),
      nouvelleMesure: uneMesureGenerale()
        .avecId('MG1')
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
        idService: 'S1',
        typeMesure: 'generale',
      },
      type: 'responsableMesure',
      date: expect.any(Date),
    });
  });

  it("ne crée pas de notification si l'acteur se nomme lui-même responable", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale()
        .avecId('MG1')
        .sansResponsable()
        .construis(),
      nouvelleMesure: uneMesureGenerale()
        .avecId('MG1')
        .avecResponsable(idActeur)
        .construis(),
    });

    await abonnement(evenement);

    const notifications = await depotDonnees.lisNotifications(idActeur);
    expect(notifications).toHaveLength(0);
  });

  describe("sur suppression d'un responsable", () => {
    let evenement: EvenementMesureServiceModifiee;

    beforeEach(() => {
      evenement = creeEvenement({
        ancienneMesure: uneMesureGenerale()
          .avecId('MG1')
          .avecResponsable(idUtilisateurNomme)
          .construis(),
        nouvelleMesure: uneMesureGenerale()
          .avecId('MG1')
          .sansResponsable()
          .construis(),
      });
    });

    it("supprime une notification lorsqu'un responsable est supprimé", async () => {
      await depotDonnees.sauvegardeNotificationTransactionnelle(
        NotificationTransactionnelle.nouveau({
          date: new Date(),
          type: 'responsableMesure',
          idActeur,
          idDestinataire: idUtilisateurNomme,
          metadonnees: {
            idMesure: 'MG1',
            idService: 'S1',
            typeMesure: 'generale',
          },
        })
      );

      await abonnement(evenement);

      const notifications =
        await depotDonnees.lisNotifications(idUtilisateurNomme);
      expect(notifications).toHaveLength(0);
    });

    it("reste robuste si la notification n'existe pas quand le responsable est supprimé", async () => {
      await abonnement(evenement);

      const notifications =
        await depotDonnees.lisNotifications(idUtilisateurNomme);
      expect(notifications).toHaveLength(0);
    });
  });
});

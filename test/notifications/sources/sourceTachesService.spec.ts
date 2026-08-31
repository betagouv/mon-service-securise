import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unUUID } from '../../constructeurs/UUID.ts';
import { TousReferentiels } from '../../../src/referentiel.interface.ts';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import * as Referentiel from '../../../src/referentiel.ts';
import { creeDepot } from '../../../src/depotDonnees.ts';
import * as adaptateurEnvironnement from '../../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import fauxAdaptateurRechercheEntreprise from '../../mocks/adaptateurRechercheEntreprise.js';
import { fabriqueBusPourLesTests } from '../../bus/aides/busPourLesTests.js';
import BusEvenements from '../../../src/bus/busEvenements.js';
import { SourceTachesService } from '../../../src/notifications/sources/sourceTachesService.ts';
import { uneTacheDeService } from '../../constructeurs/constructeurTacheDeService.js';

describe('Les notifications de tâche service', () => {
  let referentiel: TousReferentiels;
  let depotDonnees: DepotDonnees;

  const unReferentiel = (donnees: Record<string, unknown>) =>
    // @ts-expect-error On force des valeurs de test
    Referentiel.creeReferentiel(donnees);

  const laSource = () => new SourceTachesService(referentiel, depotDonnees);

  beforeEach(() => {
    referentiel = unReferentiel({
      naturesTachesService: { natureDeTest: { titre: '', lien: '/…' } },
    });
    depotDonnees = creeDepot({
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });

    depotDonnees.utilisateur = async () =>
      unUtilisateur()
        .quiSAppelle('Jean Dujardin')
        .quiSEstInscritLe('2020-01-01')
        .construis();
  });

  it('retourne les tâches', async () => {
    depotDonnees.tachesDesServices = async (idUtilisateur) =>
      idUtilisateur === unUUID('U1')
        ? [uneTacheDeService().avecId('T1').construis()]
        : [];

    const notifs = await laSource().notificationsPour(unUUID('U1'));

    expect(notifs.length).toBe(1);
    expect(notifs[0].id).toBe('T1');
    expect(notifs[0].type).toBe('tache');
    expect(notifs[0].canalDiffusion).toBe('centreNotifications');
  });

  it('retourne uniquement les tâches non lues', async () => {
    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService().avecId('T1').faiteMaintenant().construis(),
    ];

    const notifs = await laSource().notificationsPour(unUUID('U1'));

    expect(notifs.length).toBe(0);
  });

  it('complète les informations depuis le référentiel', async () => {
    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService().avecNature('niveauRetrograde').construis(),
    ];
    referentiel = unReferentiel({
      naturesTachesService: {
        niveauRetrograde: {
          entete: 'Le besoin de sécurité a été modifié',
          titreCta: 'Voir le changement',
          titre:
            'Votre service [XXX] a désormais des besoins de sécurité modérés.',
          lien: '/…',
        },
      },
    });

    const notifs = await laSource().notificationsPour(unUUID('U1'));

    expect(notifs[0].titre).toBe('Le besoin de sécurité a été modifié');
    expect(notifs[0].titreCta).toBe('Voir le changement');
    expect(notifs[0].sousTitre).toBe(
      'Votre service [XXX] a désormais des besoins de sécurité modérés.'
    );
  });

  it("indique qu'une tâche de service n'est pas supprimable", async () => {
    depotDonnees.tachesDesServices = async (idUtilisateur) =>
      idUtilisateur === unUUID('U1')
        ? [uneTacheDeService().avecId('T1').construis()]
        : [];

    const notifs = await laSource().notificationsPour(unUUID('U1'));

    expect(notifs[0].supprimable).toBe(false);
  });

  it('complète le sous-titre avec les informations liées au service', async () => {
    referentiel.enrichis({
      naturesTachesService: {
        // @ts-expect-error On force des valeurs de test
        natureDeTest: { titre: '--%NOM_SERVICE%--', lien: '' },
      },
    });

    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService().avecUnServiceNomme('toto').construis(),
    ];

    const notifs = await laSource().notificationsPour(unUUID('U1'));

    expect(notifs[0].sousTitre).toBe('--toto--');
  });

  it('complète le sous-titre avec les informations des données de la tâche', async () => {
    referentiel.enrichis({
      naturesTachesService: {
        // @ts-expect-error On force des valeurs de test
        natureDeTest: { titre: '--%nouveauxBesoins%--', lien: '' },
      },
    });

    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService()
        .avecLesDonnees({ nouveauxBesoins: 'petits' })
        .construis(),
    ];
    const notifs = await laSource().notificationsPour(unUUID('U1'));

    expect(notifs[0].sousTitre).toBe('--petits--');
  });

  it("peut utiliser n'importe quelle donnée de la tâche pour complèter le sous-titre", async () => {
    referentiel.enrichis({
      naturesTachesService: {
        // @ts-expect-error On force des valeurs de test
        natureDeTest: { titre: '--%nimportequoi%--', lien: '' },
      },
    });

    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService()
        .avecLesDonnees({ nimportequoi: 'nimportequi' })
        .construis(),
    ];
    const notifs = await laSource().notificationsPour(unUUID('U1'));

    expect(notifs[0].sousTitre).toBe('--nimportequi--');
  });

  it("complète le lien avec l'ID du service", async () => {
    referentiel.enrichis({
      naturesTachesService: {
        // @ts-expect-error On force des valeurs de test
        natureDeTest: { lien: '/service/%ID_SERVICE%/page' },
      },
    });

    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService().avecUnServiceId('S1').construis(),
    ];

    const notifs = await laSource().notificationsPour(unUUID('U1'));

    expect(notifs[0].lien).toBe('/service/S1/page');
  });

  it('ne conserve pas les données du service', async () => {
    referentiel.enrichis({
      naturesTachesService: {
        // @ts-expect-error On force des valeurs de test
        natureDeTest: { lien: '/service/%ID_SERVICE%/page' },
      },
    });

    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService().avecUnServiceId('S1').construis(),
    ];

    const notifs = await laSource().notificationsPour(unUUID('U1'));

    // @ts-expect-error on teste justement qu'on n'a pas de service
    expect(notifs[0].service).toBe(undefined);
  });

  it('indique que la tache doit être notifiée de sa lecture', async () => {
    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService().construis(),
    ];

    const notifications = await laSource().notificationsPour(unUUID('U1'));

    expect(notifications[0].doitNotifierLecture).toBe(true);
  });

  it('utilise la date de création comme horodatage', async () => {
    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService()
        .avecDateDeCreation(new Date('2024-09-13'))
        .construis(),
    ];

    const notifications = await laSource().notificationsPour(unUUID('U1'));

    expect(notifications[0].horodatage).toEqual(new Date('2024-09-13'));
  });
});

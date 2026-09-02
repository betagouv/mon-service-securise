import { fabriqueAdaptateurHorloge } from '../../../src/adaptateurs/adaptateurHorloge.ts';
import { TousReferentiels } from '../../../src/referentiel.interface.ts';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { creeDepot } from '../../../src/depotDonnees.ts';
import * as adaptateurEnvironnement from '../../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import fauxAdaptateurRechercheEntreprise from '../../mocks/adaptateurRechercheEntreprise.js';
import { fabriqueBusPourLesTests } from '../../bus/aides/busPourLesTests.js';
import BusEvenements from '../../../src/bus/busEvenements.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import * as Referentiel from '../../../src/referentiel.ts';
import { SourceNouveautes } from '../../../src/notifications/sources/sourceNouveautes.ts';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Les notifications de nouveautés', () => {
  let referentiel: TousReferentiels;
  let depotDonnees: DepotDonnees;

  const unReferentiel = (donnees: Record<string, unknown>) =>
    // @ts-expect-error On force des valeurs de test
    Referentiel.creeReferentiel(donnees);

  beforeEach(() => {
    referentiel = unReferentiel({
      nouvellesFonctionnalites: [
        { id: 'N1', dateDeDeploiement: '2024-01-01' },
        { id: 'N2', dateDeDeploiement: '2024-02-02' },
      ],
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

  const laSource = () =>
    new SourceNouveautes(
      referentiel,
      depotDonnees,
      fabriqueAdaptateurHorloge()
    );

  it("ajoute le statut 'lu' à la notification si elle l'est", async () => {
    await depotDonnees.marqueNouveauteLue(unUUID('U1'), 'N2');

    const notifications = await laSource().notificationsPour(unUUID('U1'));

    expect(notifications[0].id).toBe('N1');
    expect(notifications[0].statutLecture).toBe('nonLue');
    expect(notifications[1].id).toBe('N2');
    expect(notifications[1].statutLecture).toBe('lue');
  });

  it("indique qu'une nouveauté est supprimable", async () => {
    const notifications = await laSource().notificationsPour(unUUID('U1'));

    expect(notifications[0].supprimable).toBe(true);
  });

  it('ne retourne pas les nouveautés du futur', async () => {
    referentiel = unReferentiel({
      nouvellesFonctionnalites: [{ id: 'N1', dateDeDeploiement: '2024-01-01' }],
      tachesCompletudeProfil: [],
    });
    const decembre2023 = { maintenant: () => new Date(2023, 11, 1) };
    const source = new SourceNouveautes(
      referentiel,
      depotDonnees,
      decembre2023
    );

    const notifications = await source.notificationsPour(unUUID('U1'));

    expect(notifications.length).toBe(0);
  });

  it("ne retourne pas les nouveautés antécédentes à la création de l'utilisateur", async () => {
    referentiel = unReferentiel({
      nouvellesFonctionnalites: [{ id: 'N1', dateDeDeploiement: '2023-01-01' }],
      tachesCompletudeProfil: [],
    });
    depotDonnees.utilisateur = async () =>
      unUtilisateur()
        .quiSAppelle('Jean Dujardin')
        .quiSEstInscritLe('2024-01-01')
        .construis();
    const source = new SourceNouveautes(
      referentiel,
      depotDonnees,
      fabriqueAdaptateurHorloge()
    );

    const notifications = await source.notificationsPour(unUUID('U1'));

    expect(notifications.length).toBe(0);
  });

  it("ne retourne pas les nouveautés marquées comme 'supprimée'", async () => {
    await depotDonnees.marqueNouveauteSupprimee(unUUID('U1'), 'N2');

    const notifications = await laSource().notificationsPour(unUUID('U1'));

    expect(notifications).toHaveLength(1);
    expect(notifications[0].id).toBe('N1');
  });

  it('indique que la nouveaute doit être notifiée de sa lecture', async () => {
    const notifications = await laSource().notificationsPour(unUUID('U1'));

    expect(notifications[0].doitNotifierLecture).toBe(true);
  });

  it('utilise la date de déploiement comme horodatage', async () => {
    referentiel.enrichis({
      nouvellesFonctionnalites: [
        // @ts-expect-error On force des valeurs de test
        { id: 'N1', dateDeDeploiement: '2024-07-15' },
      ],
    });

    const notifications = await laSource().notificationsPour(unUUID('U1'));

    expect(notifications[0].horodatage).toEqual(new Date('2024-07-15'));
  });
});

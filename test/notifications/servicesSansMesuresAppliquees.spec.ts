import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unUUID, unUUIDRandom } from '../constructeurs/UUID.ts';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import { ServicesSansMesuresAppliquees } from '../../src/notifications/servicesSansMesuresAppliquees.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import { VersionService } from '../../src/modeles/versionService.ts';
import { creeDepot } from '../../src/depotDonnees.ts';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../src/referentielV2.ts';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import BusEvenements from '../../src/bus/busEvenements.js';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import { AdaptateurRechercheEntreprise } from '../../src/adaptateurs/adaptateurRechercheEntreprise.interface.ts';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';

describe("Le service qui sait indiquer quels services n'ont pas toutes les modèles de mesure appliqués", () => {
  const idService = unUUID('S');
  const idService2 = unUUID('S2');
  const idModele = unUUID('M');
  const idModele2 = unUUID('M2');
  const idUtilisateur = unUUID('U');
  const donneesMesure = {
    description: 'Une description',
    descriptionLongue: 'Une description longue',
    categorie: 'gouvernance',
  };

  let adaptateurPersistance: AdaptateurPersistance;

  const leDepot = () =>
    creeDepot({
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite:
        fauxAdaptateurRechercheEntreprise() as unknown as AdaptateurRechercheEntreprise,
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
      adaptateurPersistance,
      adaptateurPersistanceTS: unePersistanceMemoireTS().construis(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });

  beforeEach(() => {});

  it("répond vide si aucun modèle n'existe", async () => {
    const serviceV2 = unServiceV2().avecId(idService).construis();
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnUtilisateur({ id: idUtilisateur, email: 'jean.dupont@mail.fr' })
      .ajouteUnService(serviceV2.donneesAPersister().donnees, VersionService.v2)
      .construis() as unknown as AdaptateurPersistance;
    const depotDonnees: DepotDonnees = leDepot();

    const servicesSansMesuresAppliquees =
      await new ServicesSansMesuresAppliquees({
        depotDonnees,
      }).calculePour(idUtilisateur, [serviceV2]);

    expect(servicesSansMesuresAppliquees.length).toBe(0);
  });

  it('répond vide si tous les modèles sont appliqués', async () => {
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnUtilisateur({ id: idUtilisateur, email: 'jean.dupont@mail.fr' })
      .avecUnModeleDeMesureSpecifique({
        id: idModele,
        idUtilisateur,
        donnees: donneesMesure,
      })
      .ajouteUnService(
        unServiceV2().avecId(idService).donnees,
        VersionService.v2
      )
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire(idUtilisateur, idService).donnees
      )
      .construis() as unknown as AdaptateurPersistance;
    const depotDonnees: DepotDonnees = leDepot();
    const serviceV2 = await depotDonnees.service(idService);
    serviceV2!.associeMesureSpecifiqueAuModele(idModele, unUUIDRandom());
    await depotDonnees.metsAJourService(serviceV2);

    const servicesSansMesuresAppliquees =
      await new ServicesSansMesuresAppliquees({ depotDonnees }).calculePour(
        idUtilisateur,
        [serviceV2!]
      );

    expect(servicesSansMesuresAppliquees.length).toBe(0);
  });

  it('renvoie la liste des services sans mesure appliquée', async () => {
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnUtilisateur({ id: idUtilisateur, email: 'jean.dupont@mail.fr' })
      .avecUnModeleDeMesureSpecifique({
        id: idModele,
        idUtilisateur,
        donnees: donneesMesure,
      })
      .ajouteUnService(
        unServiceV2().avecId(idService).donnees,
        VersionService.v2
      )
      .ajouteUnService(
        unServiceV2().avecId(idService2).donnees,
        VersionService.v2
      )
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire(idUtilisateur, idService).donnees
      )
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire(idUtilisateur, idService2).donnees
      )
      .construis() as unknown as AdaptateurPersistance;
    const depotDonnees: DepotDonnees = leDepot();
    const serviceAvec = await depotDonnees.service(idService);
    serviceAvec!.associeMesureSpecifiqueAuModele(idModele, unUUIDRandom());
    await depotDonnees.metsAJourService(serviceAvec);
    const serviceSans = await depotDonnees.service(idService2);

    const servicesSansMesuresAppliquees =
      await new ServicesSansMesuresAppliquees({ depotDonnees }).calculePour(
        idUtilisateur,
        [serviceAvec!, serviceSans!]
      );

    expect(servicesSansMesuresAppliquees.length).toBe(1);
    expect(servicesSansMesuresAppliquees[0].id).toBe(idService2);
  });

  it('renvoie le service si les mesures sont appliquées partiellement', async () => {
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnUtilisateur({ id: idUtilisateur, email: 'jean.dupont@mail.fr' })
      .avecUnModeleDeMesureSpecifique({
        id: idModele,
        idUtilisateur,
        donnees: donneesMesure,
      })
      .avecUnModeleDeMesureSpecifique({
        id: idModele2,
        idUtilisateur,
        donnees: donneesMesure,
      })
      .ajouteUnService(
        unServiceV2().avecId(idService).donnees,
        VersionService.v2
      )
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire(idUtilisateur, idService).donnees
      )
      .construis() as unknown as AdaptateurPersistance;
    const depotDonnees: DepotDonnees = leDepot();
    const service1Sur2 = await depotDonnees.service(idService);
    service1Sur2!.associeMesureSpecifiqueAuModele(idModele, unUUIDRandom());
    await depotDonnees.metsAJourService(service1Sur2);

    const servicesSansMesuresAppliquees =
      await new ServicesSansMesuresAppliquees({ depotDonnees }).calculePour(
        idUtilisateur,
        [service1Sur2!]
      );

    expect(servicesSansMesuresAppliquees.length).toBe(1);
    expect(servicesSansMesuresAppliquees[0].id).toBe(idService);
  });
});

import {
  ConfigDepotDonnees,
  creeDepot as creeDepotComplet,
} from '../../src/depotDonnees.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unUUID, unUUIDRandom } from '../constructeurs/UUID.ts';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import {
  DonneesEntiteSupervisee,
  ServiceAdministrationOrganisations,
} from '../../src/supervision/serviceAdministrationOrganisations.js';
import { fabriqueAdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.ts';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import BusEvenements from '../../src/bus/busEvenements.js';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../src/referentielV2.ts';
import { PersistanceTS } from '../../src/adaptateurs/persistanceTS.interface.ts';
import Superviseur from '../../src/modeles/superviseur.ts';
import { AdminOrganisations } from '../../src/modeles/gestionOrganisations/adminOrganisations.ts';

describe("Le service de gestion des admins d'organisation", () => {
  const idService = unUUID('s');
  const idAdmin = unUUID('u1');
  const entite = { siret: '1234', nom: 'Un nom', departement: '75' };
  const unService = unServiceV2()
    .avecId(idService)
    .avecOrganisationResponsable(entite)
    .construis();
  let depotComplet: DepotDonnees;
  let adaptateurPersistance: AdaptateurPersistance;
  let adaptateurPersistanceTS: PersistanceTS;

  const unDepotComplet = (surcharge?: Partial<ConfigDepotDonnees>) => {
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService(unService)
      .construis() as AdaptateurPersistance;
    adaptateurPersistanceTS = unePersistanceMemoireTS()
      .ajouteAdminSurPerimetre(idAdmin, [entite])
      .construis();

    return creeDepotComplet({
      adaptateurPersistance,
      adaptateurPersistanceTS,
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
      ...surcharge,
    });
  };

  beforeEach(() => {
    depotComplet = unDepotComplet();
  });

  describe("sur demande de rattachement d'un service à ses admins", () => {
    it('crée les autorisations admins correspondantes', async () => {
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: depotComplet,
          adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationsDuService =
        await depotComplet.autorisationsDuService(idService);
      const [admin] = autorisationsDuService;
      expect(admin.idUtilisateur).toBe(idAdmin);
    });

    it("élève les droits au rôle d'admin si l'admin est un contributeur existant", async () => {
      await depotComplet.sauvegardeAutorisation(
        uneAutorisation().deProprietaire(idAdmin, idService).construis()
      );
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: depotComplet,
          adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationsDuService =
        await depotComplet.autorisationsDuService(idService);
      expect(autorisationsDuService).toHaveLength(1);
      expect(autorisationsDuService[0].estAdmin).toBe(true);
    });

    it('délègue au dépôt la suppression des autorisations admins pré-existantes', async () => {
      const mockSupprimeAutorisations = vi.fn();
      depotComplet.supprimeAutorisationsAdminPour = mockSupprimeAutorisations;
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: depotComplet,
          adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      expect(mockSupprimeAutorisations).toHaveBeenCalledWith(idService);
    });
  });

  describe("sur demande de rattachement d'un admin à une entité", () => {
    let administrationOrganisations: ServiceAdministrationOrganisations;
    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnService(
          unServiceV2()
            .avecId(unUUID('s1'))
            .avecOrganisationResponsable({ siret: '1234' }).donnees
        )
        .ajouteUnService(
          unServiceV2()
            .avecId(unUUID('s2'))
            .avecOrganisationResponsable({ siret: '1234' }).donnees
        )
        .ajouteUnService(
          unServiceV2()
            .avecId(unUUID('s3'))
            .avecOrganisationResponsable({ siret: '4567' }).donnees
        )
        .ajouteUnUtilisateur(unUtilisateur().avecId(unUUID('P')).donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire(unUUID('P'), unUUID('s3')).donnees
        )
        .construis() as unknown as AdaptateurPersistance;
      adaptateurPersistanceTS = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(idAdmin, [entite])
        .construis();
      const adaptateurChiffrement = fauxAdaptateurChiffrement();
      depotComplet = unDepotComplet({
        adaptateurPersistance,
        adaptateurPersistanceTS,
        adaptateurChiffrement,
      });
      administrationOrganisations = new ServiceAdministrationOrganisations({
        adaptateurUUID: fabriqueAdaptateurUUID(),
        depotDonnees: depotComplet,
        adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      });
    });

    it('crée le nouvel admin', async () => {
      await administrationOrganisations.rattacheEntiteA(
        entite.siret,
        unUUID('A')
      );

      const admins = await depotComplet.lisAdminsPour(entite.siret);
      expect(admins.map((a) => a.donnees().idUtilisateur)).toContain(
        unUUID('A')
      );
    });

    it("ajoute l'entité administrée à l'admin existant", async () => {
      await administrationOrganisations.rattacheEntiteA('SIRET-567', idAdmin);

      const admins = await depotComplet.lisAdminsPour('SIRET-567');
      expect(admins.map((a) => a.donnees().idUtilisateur)).toContain(idAdmin);
    });

    it("complète les données de l'entité grâce à la recherche entreprise", async () => {
      await administrationOrganisations.rattacheEntiteA('SIRET-567', idAdmin);

      const admin = await depotComplet.lisAdminOrganisations(idAdmin);
      expect(admin?.donnees().entitesAdministrees[0].nom).toBeDefined();
      expect(admin?.donnees().entitesAdministrees[1].nom).toBeDefined();
    });

    it('ajoute les autorisations correspondantes', async () => {
      await administrationOrganisations.rattacheEntiteA('1234', unUUID('A'));

      const autorisationsAdmin = await depotComplet.autorisations(unUUID('A'));

      expect(autorisationsAdmin).toHaveLength(2);
      expect(autorisationsAdmin[0].idService).toBe(unUUID('s1'));
      expect(autorisationsAdmin[1].idService).toBe(unUUID('s2'));
    });

    it("élève les droits au rôle d'admin si l'admin est un contributeur existant", async () => {
      await administrationOrganisations.rattacheEntiteA('4567', unUUID('P'));

      const autorisationsAdmin = await depotComplet.autorisations(unUUID('P'));

      expect(autorisationsAdmin).toHaveLength(1);
      expect(autorisationsAdmin[0].idService).toBe(unUUID('s3'));
      expect(autorisationsAdmin[0].estAdmin).toBe(true);
    });
  });

  describe("sur demande des entités dans le périmètre d'un utilisateur", () => {
    it("renvoie les entités d'un admin", async () => {
      adaptateurPersistanceTS = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(unUUID('A'), [{ siret: 'SIRET-123' }])
        .construis();
      const service = new ServiceAdministrationOrganisations({
        depotDonnees: unDepotComplet({ adaptateurPersistanceTS }),
        adaptateurUUID: fabriqueAdaptateurUUID(),
        adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      });

      const entitesDe = await service.entitesDe(unUUID('A'));

      expect(entitesDe).toHaveLength(1);
      expect(entitesDe[0].siret).toBe('SIRET-123');
    });

    describe('concernant les entités supervisées', () => {
      let serviceAdministrationOrganisations: ServiceAdministrationOrganisations;

      beforeEach(async () => {
        const superviseur = Superviseur.hydrate({
          idUtilisateur: unUUID('S'),
          entitesSupervisees: [{ siret: 'SIRET-123', nom: 'Mon entité' }],
        });
        await adaptateurPersistanceTS.sauvegardeSuperviseur(
          superviseur.donnees()
        );
        const adminSurSiret123 = AdminOrganisations.hydrate({
          idUtilisateur: unUUID('A'),
          entitesAdministrees: [{ siret: 'SIRET-123' }],
        });
        await adaptateurPersistanceTS.sauvegardeAdminOrganisations(
          adminSurSiret123.donnees()
        );
        await adaptateurPersistance.ajouteUtilisateur(
          unUUID('A'),
          unUtilisateur().quiSAppelle('Jean Dujardin').donnees
        );
        await adaptateurPersistance.sauvegardeService(
          unUUID('S'),
          unServiceV2().donnees,
          '',
          'SIRET-123-haché256'
        );
        await adaptateurPersistance.ajouteAutorisation(
          unUUIDRandom(),
          uneAutorisation().deProprietaire(unUUID('P'), unUUID('S')).donnees
        );
        await adaptateurPersistance.ajouteUtilisateur(
          unUUID('P'),
          unUtilisateur().donnees
        );

        serviceAdministrationOrganisations =
          new ServiceAdministrationOrganisations({
            depotDonnees: depotComplet,
            adaptateurUUID: fabriqueAdaptateurUUID(),
            adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
          });
      });

      it("renvoie les entités supervisées d'un superviseur s'il n'est pas admin", async () => {
        const entitesDe = (await serviceAdministrationOrganisations.entitesDe(
          unUUID('S')
        )) as unknown as Array<DonneesEntiteSupervisee>;

        expect(entitesDe).toHaveLength(1);
        expect(entitesDe[0].siret).toBe('SIRET-123');
        expect(entitesDe[0].nom).toBe('Mon entité');
        expect(entitesDe[0].nombreServices).toBe(1);
        expect(entitesDe[0].nombreUtilisateurs).toBe(1);
        expect(entitesDe[0].administrateurs).toEqual([
          { prenomNom: 'Jean Dujardin' },
        ]);
      });

      it("ne compte qu'une fois chaque utilisateur", async () => {
        await adaptateurPersistance.sauvegardeService(
          unUUID('S2'),
          unServiceV2().donnees,
          '',
          'SIRET-123-haché256'
        );
        await adaptateurPersistance.ajouteAutorisation(
          unUUIDRandom(),
          uneAutorisation().deProprietaire(unUUID('P'), unUUID('S2')).donnees
        );

        const entitesDe = (await serviceAdministrationOrganisations.entitesDe(
          unUUID('S')
        )) as unknown as Array<DonneesEntiteSupervisee>;

        expect(entitesDe[0].nombreServices).toBe(2);
        expect(entitesDe[0].nombreUtilisateurs).toBe(1);
      });
    });

    it("renvoie un tableau vide s'il n'est ni admin ni superviseur", async () => {
      const service = new ServiceAdministrationOrganisations({
        depotDonnees: depotComplet,
        adaptateurUUID: fabriqueAdaptateurUUID(),
        adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      });

      const entitesDe = await service.entitesDe(unUUID('U'));

      expect(entitesDe).toHaveLength(0);
    });
  });

  describe("sur demande des utilisateurs dans le périmètre d'un utilisateur", () => {
    let service: ServiceAdministrationOrganisations;

    const idSuperviseur = unUUID('S');
    const idU1 = unUUID('U1');
    const idU2 = unUUID('U2');
    const idS1 = unUUID('S1');
    const idS2 = unUUID('S2');

    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteAdminSurPerimetre(idAdmin, ['SIRET-1'])
        .ajouteSuperviseurSurPerimetre(idSuperviseur, ['SIRET-1'])
        .ajouteUnUtilisateur(unUtilisateur().avecId(idAdmin).donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId(idU1).donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId(idU2).donnees)
        .ajouteUnService(unServiceV2().avecId(idS1).donnees)
        .ajouteUnService(unServiceV2().avecId(idS2).donnees)
        .ajouteUneAutorisation(uneAutorisation().dAdmin(idAdmin, idS1).donnees)
        .ajouteUneAutorisation(uneAutorisation().dAdmin(idAdmin, idS2).donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deContributeur(idU1, idS1).donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deContributeur(idU2, idS2).donnees
        )
        .construis() as unknown as AdaptateurPersistance;
      depotComplet = unDepotComplet({
        adaptateurPersistance,
      });
      service = new ServiceAdministrationOrganisations({
        adaptateurUUID: fabriqueAdaptateurUUID(),
        depotDonnees: depotComplet,
        adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      });
    });

    it("retourne les contributeurs des services d'un admin", async () => {
      const utilisateurs = await service.utilisateursDansLePerimetreDe(idAdmin);

      expect(utilisateurs).toHaveLength(2);
      expect(utilisateurs[0].id).toBe(idU1);
      expect(utilisateurs[1].id).toBe(idU2);
    });

    it('retourne les utilisateurs administrés par un superviseur', async () => {
      const utilisateurs =
        await service.utilisateursDansLePerimetreDe(idSuperviseur);

      expect(utilisateurs).toHaveLength(1);
      expect(utilisateurs[0].id).toBe(idAdmin);
    });
  });
});

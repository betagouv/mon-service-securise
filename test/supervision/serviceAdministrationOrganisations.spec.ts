import { creeDepot as creeDepotAutorisation } from '../../src/depots/depotDonneesAutorisations.js';
import { creeDepot as creeDepotAdminOrga } from '../../src/depots/depotDonneesAdministrationOrganisations.js';
import { creeDepot as creeDepotService } from '../../src/depots/depotDonneesServices.js';
import { creeDepot as creeDepotUtilisateur } from '../../src/depots/depotDonneesUtilisateurs.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import {
  DepotDonneesPourServiceAdmin,
  ServiceAdministrationOrganisations,
} from '../../src/supervision/serviceAdministrationOrganisations.js';
import { fabriqueAdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.ts';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import { DepotDonneesAutorisation } from '../../src/depots/depotDonneesAutorisations.interface.ts';
import { DepotDonneesAdministrationOrganisations } from '../../src/depots/depotDonneesAdministrationOrganisations.interface.ts';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import { DepotDonneesSuperviseurs } from '../../src/depots/depotDonneesSuperviseurs.interface.ts';
import { DepotDonneesService } from '../../src/depots/depotDonneesService.interface.ts';
import Service from '../../src/modeles/service.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';

describe("Le service de gestion des admins d'organisation", () => {
  describe("sur demande de rattachement d'un service à ses admins", () => {
    let depotAutorisations: DepotDonneesAutorisation;
    let depotParDefaut: DepotDonneesPourServiceAdmin;
    beforeEach(() => {
      depotAutorisations = creeDepotAutorisation({
        adaptateurPersistance: unePersistanceMemoire().construis(),
        busEvenements: fabriqueBusPourLesTests(),
      });
      depotParDefaut = {
        ...depotAutorisations,
        lisAdminsPour: async () => [],
        ajouteSiretAAdmin: async () => {},
        tousLesServicesAvecSiret: async () => [],
      };
    });

    it('crée les autorisations admins correspondantes', async () => {
      const unService = unServiceV2()
        .avecId(unUUID('s'))
        .avecOrganisationResponsable({ siret: '1234' })
        .construis();
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: {
            ...depotParDefaut,
            lisAdminsPour: async () => [unUUID('u1')],
          },
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationsDuService =
        await depotAutorisations.autorisationsDuService(unUUID('s'));
      const [admin] = autorisationsDuService;
      expect(admin.idUtilisateur).toBe(unUUID('u1'));
    });

    it("élève les droits au rôle d'admin si l'admin est un contributeur existant", async () => {
      const idService = unUUID('s');
      const idProprietaire = unUUID('u1');
      const unService = unServiceV2()
        .avecId(idService)
        .avecOrganisationResponsable({ siret: '1234' })
        .construis();
      await depotAutorisations.sauvegardeAutorisation(
        uneAutorisation().deProprietaire(idProprietaire, idService).construis()
      );
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: {
            ...depotParDefaut,
            lisAdminsPour: async () => [idProprietaire],
          },
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationsDuService =
        await depotAutorisations.autorisationsDuService(idService);
      expect(autorisationsDuService).toHaveLength(1);
      expect(autorisationsDuService[0].estAdmin).toBe(true);
    });

    it('délègue au dépôt la suppression des autorisations admins pré-existantes', async () => {
      const constructeurService = unServiceV2()
        .avecId(unUUID('s'))
        .avecOrganisationResponsable({ siret: '1234' });

      const mockSupprimeAutorisations = vi.fn();
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: {
            ...depotParDefaut,
            lisAdminsPour: async () => [unUUID('u1')],
            supprimeAutorisationsAdminPour: mockSupprimeAutorisations,
          },
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(
        constructeurService.construis()
      );

      expect(mockSupprimeAutorisations).toHaveBeenCalledWith(unUUID('s'));
    });
  });

  describe("sur demande de rattachement d'un admin à une entité", () => {
    let depotAutorisations: DepotDonneesAutorisation;
    let depotAdministrationOrganisations: DepotDonneesAdministrationOrganisations;
    let adaptateurPersistance: AdaptateurPersistance;
    let administrationOrganisations: ServiceAdministrationOrganisations;
    let depotServices: DepotDonneesService & {
      tousLesServicesAvecSiret: (siret: string) => Promise<Service[]>;
    };
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
        .construis() as AdaptateurPersistance;
      depotAutorisations = creeDepotAutorisation({
        adaptateurPersistance,
        busEvenements: fabriqueBusPourLesTests(),
      });
      const adaptateurChiffrement = fauxAdaptateurChiffrement();
      depotServices = creeDepotService({
        adaptateurPersistance,
        adaptateurChiffrement,
        depotDonneesUtilisateurs: creeDepotUtilisateur({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
      });
      depotAdministrationOrganisations = creeDepotAdminOrga({
        persistance: adaptateurPersistance,
        chiffrement: adaptateurChiffrement,
        adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
        depotSuperviseurs: {} as DepotDonneesSuperviseurs,
      });
      administrationOrganisations = new ServiceAdministrationOrganisations({
        adaptateurUUID: fabriqueAdaptateurUUID(),
        depotDonnees: {
          ...depotAutorisations,
          ...depotAdministrationOrganisations,
          ...depotServices,
        },
      });
    });

    it("ajoute l'entité administrée", async () => {
      await administrationOrganisations.rattacheEntiteA(
        'SIRET-123',
        unUUID('A')
      );

      const idAdmins =
        await depotAdministrationOrganisations.lisAdminsPour('SIRET-123');
      expect(idAdmins).toEqual([unUUID('A')]);
    });

    it('ajoute les autorisations correspondantes', async () => {
      await administrationOrganisations.rattacheEntiteA('1234', unUUID('A'));

      const autorisationsAdmin = await depotAutorisations.autorisations(
        unUUID('A')
      );

      expect(autorisationsAdmin).toHaveLength(2);
      expect(autorisationsAdmin[0].idService).toBe(unUUID('s1'));
      expect(autorisationsAdmin[1].idService).toBe(unUUID('s2'));
    });

    it("élève les droits au rôle d'admin si l'admin est un contributeur existant", async () => {
      await administrationOrganisations.rattacheEntiteA('4567', unUUID('P'));

      const autorisationsAdmin = await depotAutorisations.autorisations(
        unUUID('P')
      );

      expect(autorisationsAdmin).toHaveLength(1);
      expect(autorisationsAdmin[0].idService).toBe(unUUID('s3'));
      expect(autorisationsAdmin[0].estAdmin).toBe(true);
    });
  });
});

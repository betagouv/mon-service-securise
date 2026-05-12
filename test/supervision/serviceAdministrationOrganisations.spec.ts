import { creeDepot as creeDepotAutorisation } from '../../src/depots/depotDonneesAutorisations.js';
import {
  creeDepot,
  creeDepot as creeDepotAdminOrga,
} from '../../src/depots/depotDonneesAdminsOrganisations.js';
import { creeDepot as creeDepotService } from '../../src/depots/depotDonneesServices.js';
import {
  creeDepot as creerDepotUtilisateur,
  creeDepot as creeDepotUtilisateur,
} from '../../src/depots/depotDonneesUtilisateurs.js';
import { creeDepot as creerDepotSuperviseur } from '../../src/depots/depotDonneesSuperviseurs.js';
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
import { DepotDonneesAdminsOrganisations } from '../../src/depots/depotDonneesAdminsOrganisations.interface.ts';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import { DepotDonneesService } from '../../src/depots/depotDonneesService.interface.ts';
import Service from '../../src/modeles/service.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.ts';
import { AdaptateurRechercheEntreprise } from '../../src/adaptateurs/adaptateurRechercheEntreprise.interface.ts';
import { DepotDonneesUtilisateurs } from '../../src/depots/depotDonneesUtilisateurs.interface.ts';

describe("Le service de gestion des admins d'organisation", () => {
  let depotParDefaut: DepotDonneesPourServiceAdmin;
  let depotAutorisations: DepotDonneesAutorisation;
  beforeEach(() => {
    depotAutorisations = creeDepotAutorisation({
      adaptateurPersistance: unePersistanceMemoire().construis(),
      busEvenements: fabriqueBusPourLesTests(),
    });
    depotParDefaut = {
      ...depotAutorisations,
      utilisateursAdministresPar: async () => [],
      utilisateursSupervisesPar: async () => [],
      superviseur: async () => undefined,
      entitesAdministreesPar: async () => [],
      lisAdminsPour: async () => [],
      ajouteSiretAAdmin: async () => {},
      tousLesServicesAvecSiret: async () => [],
    };
  });

  describe("sur demande de rattachement d'un service à ses admins", () => {
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
    let depotAdministrationOrganisations: DepotDonneesAdminsOrganisations;
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
        .construis() as unknown as AdaptateurPersistance;
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
      });
      administrationOrganisations = new ServiceAdministrationOrganisations({
        adaptateurUUID: fabriqueAdaptateurUUID(),
        depotDonnees: {
          ...depotParDefaut,
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

  describe("sur demande des entités dans le périmètre d'un utilisateur", () => {
    it("renvoie les entités d'un admin", async () => {
      const adaptateurPersistance = unePersistanceMemoire().construis();
      await adaptateurPersistance.ajouteEntiteAAdmin(
        unUUID('A'),
        'SIRET-123-haché',
        { siret: 'SIRET-123' }
      );
      const depotDonneesAdminsOrganisations = creeDepotAdminOrga({
        persistance: adaptateurPersistance as unknown as AdaptateurPersistance,
        chiffrement: fauxAdaptateurChiffrement(),
        adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      });
      const service = new ServiceAdministrationOrganisations({
        depotDonnees: {
          ...depotParDefaut,
          ...depotDonneesAdminsOrganisations,
        },
        adaptateurUUID: fabriqueAdaptateurUUID(),
      });

      const entitesDe = await service.entitesDe(unUUID('A'));

      expect(entitesDe).toHaveLength(1);
      expect(entitesDe[0].siret).toBe('SIRET-123');
    });

    it("renvoie les entités d'un superviseur s'il n'est pas admin", async () => {
      const adaptateurPersistance = unePersistanceMemoire().construis();
      await adaptateurPersistance.ajouteEntiteAuSuperviseur(
        unUUID('S'),
        'SIRET-123-haché',
        { siret: 'SIRET-123' }
      );
      const depotDonneesSuperviseur = creerDepotSuperviseur({
        adaptateurPersistance:
          adaptateurPersistance as unknown as AdaptateurPersistance,
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      });
      const service = new ServiceAdministrationOrganisations({
        depotDonnees: {
          ...depotParDefaut,
          ...depotDonneesSuperviseur,
        },
        adaptateurUUID: fabriqueAdaptateurUUID(),
      });

      const entitesDe = await service.entitesDe(unUUID('S'));

      expect(entitesDe).toHaveLength(1);
      expect(entitesDe[0].siret).toBe('SIRET-123');
    });

    it("renvoie un tableau vide s'il n'est ni admin ni superviseur", async () => {
      const depotDonneesSuperviseur = creerDepotSuperviseur({
        adaptateurPersistance:
          unePersistanceMemoire().construis() as unknown as AdaptateurPersistance,
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      });
      const service = new ServiceAdministrationOrganisations({
        depotDonnees: {
          ...depotParDefaut,
          ...depotDonneesSuperviseur,
        },
        adaptateurUUID: fabriqueAdaptateurUUID(),
      });

      const entitesDe = await service.entitesDe(unUUID('U'));

      expect(entitesDe).toHaveLength(0);
    });
  });

  describe("sur demande des utilisateurs dans le périmètre d'un utilisateur", () => {
    let depot: DepotDonneesAdminsOrganisations;
    let depotDonneesUtilisateurs: DepotDonneesUtilisateurs;
    let adaptateurPersistance: AdaptateurPersistance;
    let adaptateurChiffrement: AdaptateurChiffrement;
    let service: ServiceAdministrationOrganisations;
    let adaptateurRechercheEntite: AdaptateurRechercheEntreprise;

    const idAdmin = unUUID('A');
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
      adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();
      adaptateurChiffrement = fauxAdaptateurChiffrement();
      depotDonneesUtilisateurs = creerDepotUtilisateur({
        adaptateurPersistance,
        adaptateurChiffrement,
      });
      depot = creeDepot({
        persistance: adaptateurPersistance,
        chiffrement: adaptateurChiffrement,
        adaptateurRechercheEntite,
      });
      service = new ServiceAdministrationOrganisations({
        adaptateurUUID: fabriqueAdaptateurUUID(),
        depotDonnees: {
          ...depotParDefaut,
          ...depotDonneesUtilisateurs,
          ...depot,
        },
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

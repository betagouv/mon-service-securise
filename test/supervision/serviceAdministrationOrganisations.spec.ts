import {
  ConfigDepotDonnees,
  creeDepot as creeDepotComplet,
} from '../../src/depotDonnees.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import { ServiceAdministrationOrganisations } from '../../src/supervision/serviceAdministrationOrganisations.js';
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

describe("Le service de gestion des admins d'organisation", () => {
  let depotComplet: DepotDonnees;
  let adaptateurPersistance: AdaptateurPersistance;

  const unDepotComplet = (surcharge?: Partial<ConfigDepotDonnees>) => {
    adaptateurPersistance =
      unePersistanceMemoire().construis() as AdaptateurPersistance;
    return creeDepotComplet({
      adaptateurPersistance,
      adaptateurPersistanceTS: unePersistanceMemoireTS().construis(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      ...surcharge,
    });
  };

  beforeEach(() => {
    depotComplet = unDepotComplet();
  });

  describe("sur demande de rattachement d'un service à ses admins", () => {
    it('crée les autorisations admins correspondantes', async () => {
      const unService = unServiceV2()
        .avecId(unUUID('s'))
        .avecOrganisationResponsable({ siret: '1234' })
        .construis();
      depotComplet.lisAdminsPour = async () => [unUUID('u1')];
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: depotComplet,
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationsDuService = await depotComplet.autorisationsDuService(
        unUUID('s')
      );
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
      await depotComplet.sauvegardeAutorisation(
        uneAutorisation().deProprietaire(idProprietaire, idService).construis()
      );
      depotComplet.lisAdminsPour = async () => [idProprietaire];
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: depotComplet,
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationsDuService =
        await depotComplet.autorisationsDuService(idService);
      expect(autorisationsDuService).toHaveLength(1);
      expect(autorisationsDuService[0].estAdmin).toBe(true);
    });

    it('délègue au dépôt la suppression des autorisations admins pré-existantes', async () => {
      const constructeurService = unServiceV2()
        .avecId(unUUID('s'))
        .avecOrganisationResponsable({ siret: '1234' });

      const mockSupprimeAutorisations = vi.fn();
      depotComplet.lisAdminsPour = async () => [unUUID('u1')];
      depotComplet.supprimeAutorisationsAdminPour = mockSupprimeAutorisations;
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: depotComplet,
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(
        constructeurService.construis()
      );

      expect(mockSupprimeAutorisations).toHaveBeenCalledWith(unUUID('s'));
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
      const adaptateurChiffrement = fauxAdaptateurChiffrement();
      depotComplet = unDepotComplet({
        adaptateurPersistance,
        adaptateurChiffrement,
      });
      administrationOrganisations = new ServiceAdministrationOrganisations({
        adaptateurUUID: fabriqueAdaptateurUUID(),
        depotDonnees: depotComplet,
      });
    });

    it("ajoute l'entité administrée", async () => {
      await administrationOrganisations.rattacheEntiteA(
        'SIRET-123',
        unUUID('A')
      );

      const idAdmins = await depotComplet.lisAdminsPour('SIRET-123');
      expect(idAdmins).toEqual([unUUID('A')]);
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
      const adaptateurPersistanceTS = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(unUUID('A'), [{ siret: 'SIRET-123' }])
        .construis();
      const service = new ServiceAdministrationOrganisations({
        depotDonnees: unDepotComplet({ adaptateurPersistanceTS }),
        adaptateurUUID: fabriqueAdaptateurUUID(),
      });

      const entitesDe = await service.entitesDe(unUUID('A'));

      expect(entitesDe).toHaveLength(1);
      expect(entitesDe[0].siret).toBe('SIRET-123');
    });

    it("renvoie les entités d'un superviseur s'il n'est pas admin", async () => {
      await adaptateurPersistance.ajouteEntiteAuSuperviseur(
        unUUID('S'),
        'SIRET-123-haché',
        { siret: 'SIRET-123' }
      );
      const service = new ServiceAdministrationOrganisations({
        depotDonnees: depotComplet,
        adaptateurUUID: fabriqueAdaptateurUUID(),
      });

      const entitesDe = await service.entitesDe(unUUID('S'));

      expect(entitesDe).toHaveLength(1);
      expect(entitesDe[0].siret).toBe('SIRET-123');
    });

    it("renvoie un tableau vide s'il n'est ni admin ni superviseur", async () => {
      const service = new ServiceAdministrationOrganisations({
        depotDonnees: depotComplet,
        adaptateurUUID: fabriqueAdaptateurUUID(),
      });

      const entitesDe = await service.entitesDe(unUUID('U'));

      expect(entitesDe).toHaveLength(0);
    });
  });

  describe("sur demande des utilisateurs dans le périmètre d'un utilisateur", () => {
    let service: ServiceAdministrationOrganisations;

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
      depotComplet = unDepotComplet({
        adaptateurPersistance,
      });
      service = new ServiceAdministrationOrganisations({
        adaptateurUUID: fabriqueAdaptateurUUID(),
        depotDonnees: depotComplet,
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

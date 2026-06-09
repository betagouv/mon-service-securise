import {
  ConfigDepotDonnees,
  creeDepot as creeDepotComplet,
} from '../../src/depotDonnees.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unUUID, unUUIDRandom } from '../constructeurs/UUID.ts';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import { ServiceAdministrationOrganisations } from '../../src/supervision/serviceAdministrationOrganisations.js';
import { fabriqueAdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.ts';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import { fabriqueAdaptateurMailMemoire } from '../../src/adaptateurs/adaptateurMailMemoire.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import BusEvenements from '../../src/bus/busEvenements.js';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../src/referentielV2.ts';
import { PersistanceTS } from '../../src/adaptateurs/persistanceTS.interface.ts';
import Superviseur from '../../src/modeles/superviseur.ts';
import { AdminOrganisations } from '../../src/modeles/gestionOrganisations/adminOrganisations.ts';
import {
  EchecAutorisation,
  ErreurEntiteNonAdministre,
  ErreurServiceNonAdministre,
  ErreurSuppressionImpossible,
  ErreurUtilisateurNonAdministre,
} from '../../src/erreurs.ts';
import { Autorisation } from '../../src/modeles/autorisations/autorisation.ts';
import { EvenementRoleUtilisateurAdministreAttribue } from '../../src/bus/evenementRoleUtilisateurAdministreAttribue.js';
import { EvenementAccesUtilisateurAdministreRetires } from '../../src/bus/evenementAccesUtilisateurAdministreRetires.js';

type Surcharge = Partial<
  ConstructorParameters<typeof ServiceAdministrationOrganisations>[0]
>;

describe("Le service de gestion des admins d'organisation", () => {
  const idService = unUUID('s');
  const idAdmin = unUUID('u1');
  const idAncienAdmin = unUUIDRandom();
  const entite = { siret: '1234', nom: 'Un nom', departement: '75' };
  const unService = unServiceV2()
    .avecId(idService)
    .avecOrganisationResponsable(entite)
    .construis();
  let depotComplet: DepotDonnees;
  let adaptateurPersistance: AdaptateurPersistance;
  let adaptateurPersistanceTS: PersistanceTS;
  let busEvenements: ReturnType<typeof fabriqueBusPourLesTests>;

  const unDepotComplet = (surcharge?: Partial<ConfigDepotDonnees>) => {
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService(
        unServiceV2().avecId(idService).avecOrganisationResponsable(entite)
          .donnees
      )
      .ajouteUneAutorisation(
        uneAutorisation().dAdmin(idAncienAdmin, idService).donnees
      )
      .ajouteUnUtilisateur(unUtilisateur().avecId(idAncienAdmin).donnees)
      .construis() as AdaptateurPersistance;
    adaptateurPersistanceTS = unePersistanceMemoireTS()
      .ajouteAdminSurPerimetre(idAdmin, [entite])
      .construis();
    busEvenements = fabriqueBusPourLesTests();

    return creeDepotComplet({
      adaptateurPersistance,
      adaptateurPersistanceTS,
      busEvenements: busEvenements as unknown as BusEvenements,
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
      ...surcharge,
    });
  };

  const leServiceDAdministrationDesOrgas = (surcharge: Surcharge = {}) =>
    new ServiceAdministrationOrganisations({
      adaptateurUUID: fabriqueAdaptateurUUID(),
      depotDonnees: depotComplet,
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      adaptateurMail: fabriqueAdaptateurMailMemoire(),
      busEvenements: busEvenements as unknown as BusEvenements,
      ...surcharge,
    });

  beforeEach(() => {
    depotComplet = unDepotComplet();
  });

  describe("sur demande de rattachement d'un service à ses admins", () => {
    it('crée les autorisations admins correspondantes', async () => {
      const administrationOrganisations = leServiceDAdministrationDesOrgas();

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
      const administrationOrganisations = leServiceDAdministrationDesOrgas();

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationsDuService =
        await depotComplet.autorisationsDuService(idService);
      expect(autorisationsDuService).toHaveLength(1);
      expect(autorisationsDuService[0].estAdmin).toBe(true);
    });

    it('supprime les autorisations des anciens admins', async () => {
      const administrationOrganisations = leServiceDAdministrationDesOrgas();

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationSupprimee = await depotComplet.autorisationPour(
        idAncienAdmin,
        idService
      );
      expect(autorisationSupprimee).toBeUndefined();
    });
  });

  describe("sur demande de nommage d'un admin sur une entité", () => {
    let administrationOrganisations: ServiceAdministrationOrganisations;
    const idSuperviseur = unUUID('SU1');
    const siretSupervise = 'SIRET-567';
    const siretAvecUnProprietaire = '4567';

    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnService(
          unServiceV2()
            .avecId(unUUID('s1'))
            .avecOrganisationResponsable({ siret: siretSupervise }).donnees
        )
        .ajouteUnService(
          unServiceV2()
            .avecId(unUUID('s2'))
            .avecOrganisationResponsable({ siret: siretSupervise }).donnees
        )
        .ajouteUnService(
          unServiceV2()
            .avecId(unUUID('s3'))
            .avecOrganisationResponsable({ siret: siretAvecUnProprietaire })
            .donnees
        )
        .ajouteUnUtilisateur(unUtilisateur().avecId(unUUID('P')).donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId(idSuperviseur).donnees)
        .ajouteUnUtilisateur(
          unUtilisateur().avecId(unUUID('A')).avecEmail('nouvel-admin@mail.fr')
            .donnees
        )
        .ajouteUnUtilisateur(unUtilisateur().avecId(idAdmin).donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire(unUUID('P'), unUUID('s3')).donnees
        )
        .construis() as unknown as AdaptateurPersistance;
      adaptateurPersistanceTS = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(idAdmin, [entite])
        .ajouteAdminSurPerimetre(idSuperviseur, [
          entite,
          { siret: siretSupervise },
          { siret: siretAvecUnProprietaire },
        ])
        .construis();
      depotComplet = unDepotComplet({
        adaptateurPersistance,
        adaptateurPersistanceTS,
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
      });

      administrationOrganisations = leServiceDAdministrationDesOrgas();
    });

    it("jette une erreur si l'acteur n'est ni superviseur ni admin", async () => {
      const idActeur = unUUIDRandom();
      await expect(
        administrationOrganisations.nommeAdmin(
          idActeur,
          'UN-SIRET',
          unUUID('P')
        )
      ).rejects.toThrow(ErreurEntiteNonAdministre);
    });

    it("jette une erreur si l'acteur n'est pas superviseur de l'entité demandée", async () => {
      await expect(
        administrationOrganisations.nommeAdmin(
          idSuperviseur,
          'UN-SIRET-PAS-SUPERVISÉ',
          unUUID('P')
        )
      ).rejects.toThrow(ErreurEntiteNonAdministre);
    });

    it("jette une erreur si l'acteur n'est pas admin de l'entité demandée", async () => {
      await expect(
        administrationOrganisations.nommeAdmin(
          idAdmin,
          'UN-SIRET-PAS-SUPERVISÉ',
          unUUID('P')
        )
      ).rejects.toThrow(ErreurEntiteNonAdministre);
    });

    it('jette une erreur si le superviseur essaye de se nommer admin soi-même', async () => {
      await expect(
        administrationOrganisations.nommeAdmin(
          idSuperviseur,
          entite.siret,
          idSuperviseur
        )
      ).rejects.toThrow(EchecAutorisation);
    });

    it('crée le nouvel admin', async () => {
      await administrationOrganisations.nommeAdmin(
        idAdmin,
        entite.siret,
        unUUID('A')
      );

      const admins = await depotComplet.lisAdminsPour(entite.siret);
      expect(admins.map((a) => a.donnees().idUtilisateur)).toContain(
        unUUID('A')
      );
    });

    it("ajoute l'entité administrée à l'admin existant", async () => {
      await administrationOrganisations.nommeAdmin(
        idSuperviseur,
        siretSupervise,
        idAdmin
      );

      const admins = await depotComplet.lisAdminsPour(siretSupervise);
      expect(admins.map((a) => a.donnees().idUtilisateur)).toContain(idAdmin);
    });

    it("complète les données de l'entité grâce à la recherche entreprise", async () => {
      await administrationOrganisations.nommeAdmin(
        idSuperviseur,
        siretSupervise,
        idAdmin
      );

      const admin = await depotComplet.lisAdminOrganisations(idAdmin);
      expect(admin?.donnees().entitesAdministrees[0].nom).toBeDefined();
      expect(admin?.donnees().entitesAdministrees[1].nom).toBeDefined();
    });

    it('ajoute les autorisations correspondantes', async () => {
      await administrationOrganisations.nommeAdmin(
        idSuperviseur,
        siretSupervise,
        unUUID('A')
      );

      const autorisationsAdmin = await depotComplet.autorisations(unUUID('A'));

      expect(autorisationsAdmin).toHaveLength(2);
      expect(autorisationsAdmin[0].idService).toBe(unUUID('s1'));
      expect(autorisationsAdmin[1].idService).toBe(unUUID('s2'));
    });

    it("élève les droits au rôle d'admin si l'admin est un contributeur existant", async () => {
      await administrationOrganisations.nommeAdmin(
        idSuperviseur,
        siretAvecUnProprietaire,
        unUUID('P')
      );

      const autorisationsAdmin = await depotComplet.autorisations(unUUID('P'));

      expect(autorisationsAdmin).toHaveLength(1);
      expect(autorisationsAdmin[0].idService).toBe(unUUID('s3'));
      expect(autorisationsAdmin[0].estAdmin).toBe(true);
    });

    it("notifie par email l'admin nommé", async () => {
      const adaptateurMail = fabriqueAdaptateurMailMemoire();
      const envoieMessageNominationAdmin = vi.fn();
      adaptateurMail.envoieMessageNominationAdmin =
        envoieMessageNominationAdmin;

      const service = leServiceDAdministrationDesOrgas({ adaptateurMail });

      await service.nommeAdmin(idSuperviseur, siretSupervise, unUUID('A'));

      expect(envoieMessageNominationAdmin).toHaveBeenCalledWith(
        'nouvel-admin@mail.fr'
      );
    });
  });

  describe("sur demande des entités dans le périmètre d'un utilisateur, qu'il soit admin ou superviseur", () => {
    let serviceAdministrationOrganisations: ServiceAdministrationOrganisations;

    beforeEach(async () => {
      const mairieDeX = { siret: 'SIRET-123', nom: 'Mon entité' };
      const superviseur = Superviseur.hydrate({
        idUtilisateur: unUUID('S'),
        entitesSupervisees: [mairieDeX],
      });
      const adminSurSiret123 = AdminOrganisations.hydrate({
        idUtilisateur: unUUID('A'),
        entitesAdministrees: [mairieDeX],
      });
      await adaptateurPersistanceTS.sauvegardeSuperviseur(
        superviseur.donnees()
      );
      await adaptateurPersistanceTS.sauvegardeAdminOrganisations(
        adminSurSiret123.donnees()
      );
      await adaptateurPersistance.ajouteUtilisateur(
        unUUID('A'),
        unUtilisateur().quiSAppelle('Jean Dujardin').avecPostes(['RSSI'])
          .donnees
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

      serviceAdministrationOrganisations = leServiceDAdministrationDesOrgas();
    });

    it("sait renvoyer les entités du point-de-vue d'un admin : l'admin est alors lui-même présent dans les admins renvoyés", async () => {
      const service = leServiceDAdministrationDesOrgas();

      const entitesDe = await service.entitesDe(unUUID('A'));

      expect(entitesDe).toHaveLength(1);
      expect(entitesDe[0].siret).toBe('SIRET-123');
      expect(entitesDe[0].nom).toBe('Mon entité');
      expect(entitesDe[0].nombreServices).toBe(1);
      expect(entitesDe[0].nombreUtilisateurs).toBe(1);
      expect(entitesDe[0].administrateurs).toEqual([
        {
          id: unUUID('A'),
          prenomNom: 'Jean Dujardin',
          initiales: 'JD',
          postes: 'RSSI',
        },
      ]);
    });

    it("sait renvoyer les entités du point-de-vue d'un superviseur (s'il n'est pas admin) : même structure que ci-dessus", async () => {
      const entitesDe = await serviceAdministrationOrganisations.entitesDe(
        unUUID('S')
      );

      expect(entitesDe).toHaveLength(1);
      expect(entitesDe[0].siret).toBe('SIRET-123');
      expect(entitesDe[0].nom).toBe('Mon entité');
      expect(entitesDe[0].nombreServices).toBe(1);
      expect(entitesDe[0].nombreUtilisateurs).toBe(1);
      expect(entitesDe[0].administrateurs).toEqual([
        {
          id: unUUID('A'),
          prenomNom: 'Jean Dujardin',
          initiales: 'JD',
          postes: 'RSSI',
        },
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

      const entitesDe = await serviceAdministrationOrganisations.entitesDe(
        unUUID('S')
      );

      expect(entitesDe[0].nombreServices).toBe(2);
      expect(entitesDe[0].nombreUtilisateurs).toBe(1);
    });

    it("renvoie un tableau vide s'il n'est ni admin ni superviseur", async () => {
      const service = leServiceDAdministrationDesOrgas();

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

      depotComplet = unDepotComplet({ adaptateurPersistance });

      service = leServiceDAdministrationDesOrgas();
    });

    it("retourne les contributeurs des services d'un admin", async () => {
      const utilisateurs = await service.utilisateursDansLePerimetreDe(idAdmin);

      expect(utilisateurs).toHaveLength(2);
      expect(utilisateurs[0].id).toBe(idU1);
      expect(utilisateurs[1].id).toBe(idU2);
    });
  });

  describe("sur demande de retrait d'une entité administrée", () => {
    let service: ServiceAdministrationOrganisations;
    const siret = 'SIRET-1';
    const autreSiret = '12345';
    const siretSeulAdmin = 'SIRET-SEUL-ADMIN';
    const idService2 = unUUID('S2');
    const idService3 = unUUID('S3');
    const idContributeurS3 = unUUID('U3');
    const idSuperviseur = unUUID('SU1');

    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteAdminSurPerimetre(idAdmin, [siret, siretSeulAdmin])
        .ajouteUnUtilisateur(unUtilisateur().avecId(idAdmin).donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId(idContributeurS3).donnees)
        .ajouteUnService(
          unServiceV2().avecId(idService).avecOrganisationResponsable({ siret })
            .donnees
        )
        .ajouteUnService(
          unServiceV2()
            .avecId(idService2)
            .avecOrganisationResponsable({ siret: autreSiret }).donnees
        )
        .ajouteUnService(
          unServiceV2()
            .avecId(idService3)
            .avecOrganisationResponsable({ siret: siretSeulAdmin }).donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().dAdmin(idAdmin, idService).donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire(unUUIDRandom(), idService).donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire(idAdmin, idService2).donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().dAdmin(idAdmin, idService3).donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deContributeur(idContributeurS3, idService3).donnees
        )
        .construis() as unknown as AdaptateurPersistance;
      adaptateurPersistanceTS = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(idAdmin, [{ siret }])
        .ajouteSuperviseurSurPerimetre(idSuperviseur, [
          { siret },
          { siret: siretSeulAdmin },
        ])
        .construis();

      depotComplet = unDepotComplet({
        adaptateurPersistance,
        adaptateurPersistanceTS,
      });

      service = leServiceDAdministrationDesOrgas();
    });

    it("jette une erreur si l'acteur n'est ni superviseur ni admin", async () => {
      const idActeur = unUUIDRandom();
      await expect(
        service.retireAdmin(idActeur, siret, unUUIDRandom())
      ).rejects.toThrow(ErreurEntiteNonAdministre);
    });

    it("jette une erreur si l'acteur n'est pas superviseur de l'entité demandée", async () => {
      await expect(
        service.retireAdmin(
          idSuperviseur,
          'UN-SIRET-PAS-SUPERVISÉ',
          unUUIDRandom()
        )
      ).rejects.toThrow(ErreurEntiteNonAdministre);
    });

    it("jette une erreur si l'acteur n'est pas admin de l'entité demandée", async () => {
      await expect(
        service.retireAdmin(idAdmin, 'UN-SIRET-PAS-SUPERVISÉ', unUUIDRandom())
      ).rejects.toThrow(ErreurEntiteNonAdministre);
    });

    it("jette une erreur si l'acteur essaye de se retirer lui même", async () => {
      await expect(
        service.retireAdmin(idAdmin, siret, idAdmin)
      ).rejects.toThrow(EchecAutorisation);
    });

    it("ne jette pas d'erreur si l'utilisateur n'est pas admin", async () => {
      await expect(
        service.retireAdmin(idAdmin, siret, unUUIDRandom())
      ).resolves.not.toThrow();
    });

    it("retire l'entité du périmètre de l'admin", async () => {
      await service.retireAdmin(idSuperviseur, siret, idAdmin);

      const adminAJour = await depotComplet.lisAdminOrganisations(idAdmin);
      expect(adminAJour?.estAdminDe(siret)).toBe(false);
    });

    it('supprime les autorisations admin sur les services de ce siret', async () => {
      await service.retireAdmin(idSuperviseur, siret, idAdmin);

      const autorisations = await depotComplet.autorisations(idAdmin);
      expect(autorisations).toHaveLength(2);
      expect(autorisations[0].idService).toBe(idService2);
    });

    it("jette une erreur si l'admin est dernier 'propriétaire' (ou admin) d'un des services administrés", async () => {
      await expect(
        service.retireAdmin(idSuperviseur, siretSeulAdmin, idAdmin)
      ).rejects.toThrow(ErreurSuppressionImpossible);
    });
  });

  describe("sur demande d'attribution d'un rôle à un utilisateur administré", () => {
    let service: ServiceAdministrationOrganisations;
    const idU1 = unUUID('U1');
    const idAutreAdmin = unUUID('A2');
    const idS1 = unUUID('S1');
    const idS2 = unUUID('S2');

    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteAdminSurPerimetre(idAdmin, ['SIRET-1'])
        .ajouteAdminSurPerimetre(idAutreAdmin, ['SIRET-1'])
        .ajouteUnUtilisateur(unUtilisateur().avecId(idAdmin).donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId(idAutreAdmin).donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId(idU1).donnees)
        .ajouteUnService(unServiceV2().avecId(idS1).donnees)
        .ajouteUnService(unServiceV2().avecId(idS2).donnees)
        .ajouteUneAutorisation(uneAutorisation().dAdmin(idAdmin, idS1).donnees)
        .ajouteUneAutorisation(uneAutorisation().dAdmin(idAdmin, idS2).donnees)
        .ajouteUneAutorisation(
          uneAutorisation().dAdmin(idAutreAdmin, idS1).donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deContributeur(idU1, idS1).donnees
        )
        .construis() as unknown as AdaptateurPersistance;

      depotComplet = unDepotComplet({ adaptateurPersistance });

      service = leServiceDAdministrationDesOrgas();
    });

    it("jette une erreur si l'utilisateur n'est pas administré par l'admin courant", async () => {
      const unAutreUtilisateur = unUUIDRandom();

      await expect(
        service.attribueRoleAUtilisateurAdministre(
          idAdmin,
          unAutreUtilisateur,
          Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
          [idS1]
        )
      ).rejects.toThrow(ErreurUtilisateurNonAdministre);
    });

    it("jette une erreur si un des services n'est pas administré", async () => {
      await expect(
        service.attribueRoleAUtilisateurAdministre(
          idAdmin,
          idU1,
          Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
          [unUUIDRandom()]
        )
      ).rejects.toThrow(ErreurServiceNonAdministre);
    });

    it("jette une erreur si l'utilisateur cible est admin d'un des services ciblés", async () => {
      await expect(
        service.attribueRoleAUtilisateurAdministre(
          idAdmin,
          idAutreAdmin,
          Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
          [idS1]
        )
      ).rejects.toThrow(EchecAutorisation);
    });

    it.each([
      {
        role: Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
        estProprietaireAttendu: true,
      },
      {
        role: Autorisation.RESUME_NIVEAU_DROIT.LECTURE,
        estProprietaireAttendu: false,
      },
      {
        role: Autorisation.RESUME_NIVEAU_DROIT.ECRITURE,
        estProprietaireAttendu: false,
      },
    ])(
      'attribue le rôle $role sur chaque service',
      async ({ role, estProprietaireAttendu }) => {
        await service.attribueRoleAUtilisateurAdministre(idAdmin, idU1, role, [
          idS1,
        ]);

        const autorisationAJour = await depotComplet.autorisationPour(
          idU1,
          idS1
        );
        expect(autorisationAJour.estProprietaire).toBe(estProprietaireAttendu);
        expect(autorisationAJour.resumeNiveauDroit()).toBe(role);
      }
    );

    it('publie un évènement de rôle utilisateur administré attribué sur le bus', async () => {
      await service.attribueRoleAUtilisateurAdministre(
        idAdmin,
        idU1,
        Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
        [idS1]
      );

      expect(
        busEvenements.aRecuUnEvenement(
          EvenementRoleUtilisateurAdministreAttribue
        )
      ).toBe(true);
      const evenement: EvenementRoleUtilisateurAdministreAttribue =
        busEvenements.recupereEvenement(
          EvenementRoleUtilisateurAdministreAttribue
        );
      expect(evenement.idAdmin).toBe(idAdmin);
      expect(evenement.idUtilisateurAdministre).toBe(idU1);
      expect(evenement.idsServices).toEqual([idS1]);
      expect(evenement.role).toBe(
        Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE
      );
    });

    it.each([
      {
        role: Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
        estProprietaireAttendu: true,
      },
      {
        role: Autorisation.RESUME_NIVEAU_DROIT.LECTURE,
        estProprietaireAttendu: false,
      },
      {
        role: Autorisation.RESUME_NIVEAU_DROIT.ECRITURE,
        estProprietaireAttendu: false,
      },
    ])(
      "peut attribuer le rôle $role sur un service sur lequel l'utilisateur administré n'est pas contributeur",
      async ({ role, estProprietaireAttendu }) => {
        await service.attribueRoleAUtilisateurAdministre(idAdmin, idU1, role, [
          idS2,
        ]);

        const autorisationAJour = await depotComplet.autorisationPour(
          idU1,
          idS2
        );
        expect(autorisationAJour.estProprietaire).toBe(estProprietaireAttendu);
        expect(autorisationAJour.resumeNiveauDroit()).toBe(role);
      }
    );
  });

  describe("sur demande de retrait des accès d'un utilisateur administré", () => {
    let service: ServiceAdministrationOrganisations;
    const idU1 = unUUID('U1');
    const idAutreAdmin = unUUID('A2');
    const idS1 = unUUID('S1');

    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteAdminSurPerimetre(idAdmin, ['SIRET-1'])
        .ajouteAdminSurPerimetre(idAutreAdmin, ['SIRET-1'])
        .ajouteUnUtilisateur(unUtilisateur().avecId(idAdmin).donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId(idAutreAdmin).donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId(idU1).donnees)
        .ajouteUnService(unServiceV2().avecId(idS1).donnees)
        .ajouteUneAutorisation(uneAutorisation().dAdmin(idAdmin, idS1).donnees)
        .ajouteUneAutorisation(
          uneAutorisation().dAdmin(idAutreAdmin, idS1).donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deContributeur(idU1, idS1).donnees
        )
        .construis() as unknown as AdaptateurPersistance;

      depotComplet = unDepotComplet({ adaptateurPersistance });

      service = leServiceDAdministrationDesOrgas();
    });

    it("jette une erreur si l'utilisateur n'est pas administré par l'admin courant", async () => {
      const unAutreUtilisateur = unUUIDRandom();

      await expect(
        service.retireAccesUtilisateurAdministre(idAdmin, unAutreUtilisateur, [
          idS1,
        ])
      ).rejects.toThrow(ErreurUtilisateurNonAdministre);
    });

    it("jette une erreur si un des services n'est pas administré", async () => {
      await expect(
        service.retireAccesUtilisateurAdministre(idAdmin, idU1, [
          unUUIDRandom(),
        ])
      ).rejects.toThrow(ErreurServiceNonAdministre);
    });

    it("jette une erreur si l'utilisateur cible est admin d'un des services ciblés", async () => {
      await expect(
        service.retireAccesUtilisateurAdministre(idAdmin, idAutreAdmin, [idS1])
      ).rejects.toThrow(EchecAutorisation);
    });

    it("supprime l'autorisations sur chaque service", async () => {
      await service.retireAccesUtilisateurAdministre(idAdmin, idU1, [idS1]);

      const autorisationSupprimee = await depotComplet.autorisationPour(
        idU1,
        idS1
      );
      expect(autorisationSupprimee).toBeUndefined();
    });

    it("publie un évènement d'accès utilisateur administré retirés sur le bus", async () => {
      await service.retireAccesUtilisateurAdministre(idAdmin, idU1, [idS1]);

      expect(
        busEvenements.aRecuUnEvenement(
          EvenementAccesUtilisateurAdministreRetires
        )
      ).toBe(true);
      const evenement: EvenementAccesUtilisateurAdministreRetires =
        busEvenements.recupereEvenement(
          EvenementAccesUtilisateurAdministreRetires
        );
      expect(evenement.idAdmin).toBe(idAdmin);
      expect(evenement.idUtilisateurAdministre).toBe(idU1);
      expect(evenement.idsServices).toEqual([idS1]);
    });
  });

  describe("sur demande d'assignation d'un périmètre à un admin", () => {
    let service: ServiceAdministrationOrganisations;
    const idActeur = unUUID('A1');
    const idNouvelAdmin = unUUIDRandom();

    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId(idAdmin).donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId(idNouvelAdmin).donnees)
        .ajouteUnService(unServiceV2().avecId(idService).donnees)
        .construis() as unknown as AdaptateurPersistance;

      adaptateurPersistanceTS = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(idActeur, [
          { siret: 'SIRET-1' },
          { siret: 'SIRET-2' },
        ])
        .ajouteAdminSurPerimetre(idAdmin, [{ siret: 'SIRET-2' }])
        .construis();

      depotComplet = unDepotComplet({
        adaptateurPersistance,
        adaptateurPersistanceTS,
      });

      service = leServiceDAdministrationDesOrgas();
    });

    it("jette une erreur si l'admin acteur n'administre pas le périmètre complet demandé", async () => {
      await expect(() =>
        service.assignePerimetre(idActeur, idAdmin, ['UN-AUTRE-SIRET'])
      ).rejects.toThrow(ErreurEntiteNonAdministre);
    });

    it("jette une erreur si l'acteur n'est pas admin", async () => {
      const idPasAdmin = unUUIDRandom();
      await expect(() =>
        service.assignePerimetre(idPasAdmin, idAdmin, ['UN-AUTRE-SIRET'])
      ).rejects.toThrow(ErreurEntiteNonAdministre);
    });

    it("crée l'administrateur s'il n'existe pas", async () => {
      await service.assignePerimetre(idActeur, idNouvelAdmin, ['SIRET-1']);

      const admin = await depotComplet.lisAdminOrganisations(idNouvelAdmin);
      expect(admin!.estAdminDe('SIRET-1')).toBeTruthy();
    });

    it('ajoute les nouvelles entités', async () => {
      await service.assignePerimetre(idActeur, idAdmin, ['SIRET-1']);

      const admin = await depotComplet.lisAdminOrganisations(idAdmin);
      expect(admin!.estAdminDe('SIRET-1')).toBeTruthy();
    });

    it('retire les entités qui ne sont plus adminisitrées', async () => {
      await service.assignePerimetre(idActeur, idAdmin, ['SIRET-1']);

      const admin = await depotComplet.lisAdminOrganisations(idAdmin);
      expect(admin!.estAdminDe('SIRET-2')).toBeFalsy();
    });

    it('conserve les entités encore administrées', async () => {
      await service.assignePerimetre(idActeur, idAdmin, ['SIRET-2']);

      const admin = await depotComplet.lisAdminOrganisations(idAdmin);
      expect(admin!.estAdminDe('SIRET-2')).toBeTruthy();
    });
  });
});

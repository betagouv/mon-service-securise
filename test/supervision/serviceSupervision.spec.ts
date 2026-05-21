import ServiceSupervision from '../../src/supervision/serviceSupervision.js';
import { unService } from '../constructeurs/constructeurService.js';
import { AdaptateurSupervision } from '../../src/adaptateurs/adaptateurSupervision.interface.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import Superviseur from '../../src/modeles/superviseur.ts';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';

describe('Le service de supervision', () => {
  let adaptateurSupervision: AdaptateurSupervision;
  let depotDonnees: DepotDonnees;
  let serviceSupervision: ServiceSupervision;

  beforeEach(() => {
    adaptateurSupervision = {
      revoqueSuperviseur: async () => {},
      relieSuperviseursAService: async () => {},
      delieServiceDesSuperviseurs: async () => {},
    } as unknown as AdaptateurSupervision;
    depotDonnees = {
      lisSuperviseursPour: async () => {},
      lisSuperviseur: async () => undefined,
      sauvegardeSuperviseur: async () => {},
      tousLesServicesAvecSiret: async () => [],
      revoqueSuperviseur: async () => {},
    } as unknown as DepotDonnees;
    serviceSupervision = new ServiceSupervision({
      depotDonnees,
      adaptateurSupervision,
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
    });
  });

  it("jette une erreur s'il n'est pas instancié avec les bons adaptateurs", () => {
    // @ts-expect-error On force une mauvaise instanciation
    expect(() => new ServiceSupervision({})).toThrow(
      new Error(
        "Impossible d'instancier le service de supervision sans ses dépendances"
      )
    );
  });

  describe('sur demande de liaison entre un service et des superviseurs', () => {
    it('délègue au dépôt la lecture des superviseurs concernés', async () => {
      let siretRecu;
      depotDonnees.lisSuperviseursPour = async (siret) => {
        siretRecu = siret;
        return [];
      };
      const service = unService()
        .avecOrganisationResponsable({ siret: '12345' })
        .construis();

      await serviceSupervision.relieServiceEtSuperviseurs(service);

      expect(siretRecu).toBe('12345');
    });

    it("délègue à l'adaptateur la création du lien", async () => {
      let idsSuperviseurRecus;
      let serviceRecu;
      adaptateurSupervision.relieSuperviseursAService = async (
        service,
        idsSuperviseurs
      ) => {
        idsSuperviseurRecus = idsSuperviseurs;
        serviceRecu = service;
      };
      const idSuperviseur = unUUID('S');

      depotDonnees.lisSuperviseursPour = async () => [
        Superviseur.hydrate({
          idUtilisateur: idSuperviseur,
          entitesSupervisees: [],
        }),
      ];

      const service = unService()
        .avecOrganisationResponsable({ siret: '12345' })
        .avecId('S1')
        .construis();

      await serviceSupervision.relieServiceEtSuperviseurs(service);

      expect(idsSuperviseurRecus).toEqual([idSuperviseur]);
      expect(serviceRecu).toBe(service);
    });

    it("n'appelle pas l'adaptateur si aucun superviseur n'est concerné par le service", async () => {
      let supervisionAppelee = false;
      adaptateurSupervision.relieSuperviseursAService = async () => {
        supervisionAppelee = true;
      };

      depotDonnees.lisSuperviseursPour = async () => [];

      const service = unService().construis();

      await serviceSupervision.relieServiceEtSuperviseurs(service);

      expect(supervisionAppelee).toBe(false);
    });
  });

  describe('sur demande de suppression du lien entre un service et des superviseurs', () => {
    it("délègue à l'adaptateur la suppression du lien", async () => {
      let idServiceRecu;
      adaptateurSupervision.delieServiceDesSuperviseurs = async (idService) => {
        idServiceRecu = idService;
      };

      await serviceSupervision.delieServiceEtSuperviseurs(unUUID('1'));

      expect(idServiceRecu).toBe(unUUID('1'));
    });
  });

  describe('sur demande de modification du lien entre un service et des superviseurs', () => {
    it("appele successivement les méthodes de suppression et d'ajout de lien", async () => {
      let idServiceRecuParSuppression;
      let serviceRecuParAjout;
      serviceSupervision.delieServiceEtSuperviseurs = async (idService) => {
        idServiceRecuParSuppression = idService;
      };
      serviceSupervision.relieServiceEtSuperviseurs = async (service) => {
        serviceRecuParAjout = service;
      };

      const service = unService().avecId('S1').construis();

      await serviceSupervision.modifieLienServiceEtSuperviseurs(service);

      expect(idServiceRecuParSuppression).toBe('S1');
      expect(serviceRecuParAjout!.id).toBe('S1');
    });
  });

  describe("sur demande de génération de l'URL de supervision", () => {
    it("délègue la génération à l'adaptateur de supervision", () => {
      let idRecu;
      let filtreRecu;
      adaptateurSupervision.genereURLSupervision = (idSuperviseur, filtres) => {
        idRecu = idSuperviseur;
        filtreRecu = filtres;
        return 'URL1';
      };

      const url = serviceSupervision.genereURLSupervision(unUUID('1'), {
        filtreDate: 'aujourdhui',
      });

      expect(idRecu).toBe(unUUID('1'));
      expect(filtreRecu!.filtreDate).toBe('aujourdhui');
      expect(url).toBe('URL1');
    });
  });

  describe("sur demande d'attachement d'une entité à un superviseur", () => {
    it("crée le superviseur s'il n'existe pas", async () => {
      let superviseurSauvegarde: Superviseur | undefined;
      depotDonnees.lisSuperviseur = async () => undefined;
      depotDonnees.sauvegardeSuperviseur = async (s: Superviseur) => {
        superviseurSauvegarde = s;
      };

      await serviceSupervision.rattacheEntiteAuSuperviseur(
        'SIRET-123',
        unUUID('S')
      );

      expect(superviseurSauvegarde!.donnees().idUtilisateur).toBe(unUUID('S'));
    });

    it("ajoute l'entité supervisée au superviseur existant", async () => {
      const superviseurExistant = Superviseur.hydrate({
        idUtilisateur: unUUID('S'),
        entitesSupervisees: [{ siret: 'SIRET-A' }],
      });
      depotDonnees.lisSuperviseur = async () => superviseurExistant;
      let superviseurSauvegarde: Superviseur | undefined;
      depotDonnees.sauvegardeSuperviseur = async (s: Superviseur) => {
        superviseurSauvegarde = s;
      };

      await serviceSupervision.rattacheEntiteAuSuperviseur(
        'SIRET-123',
        unUUID('S')
      );

      expect(superviseurSauvegarde!.donnees().entitesSupervisees).toHaveLength(
        2
      );
    });

    it("complète les données de l'entité grâce à la recherche entreprise", async () => {
      let siretRecu;
      const adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();
      adaptateurRechercheEntite.rechercheOrganisations = async (siret) => {
        siretRecu = siret;
        return [];
      };
      serviceSupervision = new ServiceSupervision({
        depotDonnees,
        adaptateurSupervision,
        adaptateurRechercheEntite,
      });

      await serviceSupervision.rattacheEntiteAuSuperviseur(
        'SIRET-123',
        unUUID('S')
      );

      expect(siretRecu).toBe('SIRET-123');
    });

    it('lie les services existants avec ce siret au superviseur', async () => {
      const service = unService()
        .avecOrganisationResponsable({ siret: 'SIRET-123' })
        .construis();
      depotDonnees.tousLesServicesAvecSiret = async () => [service];
      depotDonnees.lisSuperviseursPour = async () => [
        Superviseur.hydrate({
          idUtilisateur: unUUID('S'),
          entitesSupervisees: [{ siret: 'SIRET-123' }],
        }),
      ];
      let serviceRecu;
      adaptateurSupervision.relieSuperviseursAService = async (s) => {
        serviceRecu = s;
      };

      await serviceSupervision.rattacheEntiteAuSuperviseur(
        'SIRET-123',
        unUUID('S')
      );

      expect(serviceRecu).toBe(service);
    });
  });

  describe('sur demande de révocation des droits de supervision', () => {
    it("délègue à l'adaptateur de supervision la suppression côté supervision", async () => {
      let idRecu;
      adaptateurSupervision.revoqueSuperviseur = async (idSuperviseur) => {
        idRecu = idSuperviseur;
      };

      await serviceSupervision.revoqueSuperviseur(unUUID('1'));

      expect(idRecu).toBe(unUUID('1'));
    });

    it('délègue au dépôt de données la suppression des liens siret-superviseur', async () => {
      let idRecu;
      depotDonnees.revoqueSuperviseur = async (idSuperviseur) => {
        idRecu = idSuperviseur;
      };

      await serviceSupervision.revoqueSuperviseur(unUUID('1'));

      expect(idRecu).toBe(unUUID('1'));
    });
  });
});

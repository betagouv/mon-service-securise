import { unUUID } from '../../constructeurs/UUID.ts';
import { traceAccesUtilisateurAdministreRetiresDansAudit } from '../../../src/bus/abonnements/traceEvenementsAuditAdministrationOrganisations.ts';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { unePersistanceMemoire } from '../../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { AdaptateurPersistance } from '../../../src/adaptateurs/adaptateurPersistance.interface.ts';
import { creeDepot as creeDepotComplet } from '../../../src/depotDonnees.ts';
import * as adaptateurEnvironnement from '../../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import fauxAdaptateurRechercheEntreprise from '../../mocks/adaptateurRechercheEntreprise.js';
import fauxAdaptateurChiffrement from '../../mocks/adaptateurChiffrement.js';
import { fabriqueBusPourLesTests } from '../aides/busPourLesTests.js';
import BusEvenements from '../../../src/bus/busEvenements.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { AdaptateurAuditAdminOrganisations } from '../../../src/adaptateurs/adaptateurAuditAdminOrganisations.interface.ts';
import { TraceAudit } from '../../../src/modeles/gestionOrganisations/traceAudit.ts';

describe("L'abonnement qui trace les évènements d'administration d'organisations", () => {
  const idUtilisateurAdmin = unUUID('A');
  const idUtilisateurCible = unUUID('U');
  const idService = unUUID('S');
  const idService2 = unUUID('T');
  let depotDonnees: DepotDonnees;
  let adaptateurAuditAdminOrganisations: AdaptateurAuditAdminOrganisations;

  beforeEach(() => {
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService(
        unServiceV2()
          .avecId(idService)
          .avecOrganisationResponsable({ siret: '1234' }).donnees
      )
      .ajouteUnService(
        unServiceV2()
          .avecId(idService2)
          .avecOrganisationResponsable({ siret: '1234' }).donnees
      )
      .ajouteUnUtilisateur(
        unUtilisateur().avecId(idUtilisateurAdmin).avecEmail('admin@mail.fr')
          .donnees
      )
      .ajouteUnUtilisateur(
        unUtilisateur().avecId(idUtilisateurCible).avecEmail('cible@mail.fr')
          .donnees
      )
      .construis() as AdaptateurPersistance;

    adaptateurAuditAdminOrganisations = {
      trace: () => {},
    } as unknown as AdaptateurAuditAdminOrganisations;

    depotDonnees = creeDepotComplet({
      adaptateurPersistance,
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });
  });

  describe("sur retrait d'accès à un utilisateur administré", () => {
    it("consigne un événement de retrait d'accès", async () => {
      let donneesRecues: TraceAudit<'RETRAIT_ACCES'> | undefined;
      adaptateurAuditAdminOrganisations.trace = async (donnees) => {
        donneesRecues = donnees;
      };

      await traceAccesUtilisateurAdministreRetiresDansAudit({
        depotDonnees,
        adaptateurAuditAdminOrganisations,
      })({
        idAdmin: idUtilisateurAdmin,
        idUtilisateurAdministre: idUtilisateurCible,
        idsServices: [idService],
      });

      expect(donneesRecues).toBeDefined();
      expect(donneesRecues!.acteur.id).toBe(idUtilisateurAdmin);
      expect(donneesRecues!.acteur.email).toBe('admin@mail.fr');
      expect(donneesRecues!.utilisateurCible.id).toBe(idUtilisateurCible);
      expect(donneesRecues!.utilisateurCible.email).toBe('cible@mail.fr');
      expect(donneesRecues!.serviceCible!.id).toBe(idService);
      expect(donneesRecues!.serviceCible!.siretDeOrganisation()).toBe('1234');
      expect(donneesRecues!.entiteCible.siret).toBe('1234');
      expect(donneesRecues!.typeAction).toBe('RETRAIT_ACCES');
    });

    it("consigne un événement de retrait d'accès par identifiant de service", async () => {
      adaptateurAuditAdminOrganisations.trace = vi.fn();

      await traceAccesUtilisateurAdministreRetiresDansAudit({
        depotDonnees,
        adaptateurAuditAdminOrganisations,
      })({
        idAdmin: idUtilisateurAdmin,
        idUtilisateurAdministre: idUtilisateurCible,
        idsServices: [idService, idService2],
      });

      expect(adaptateurAuditAdminOrganisations.trace).toHaveBeenCalledTimes(2);
    });

    it.each(['idAdmin', 'idUtilisateurAdministre', 'idsServices'])(
      "lève une exception s'il ne reçoit pas de %s",
      async (proprieteObligatoire) => {
        const payload = {
          idAdmin: idUtilisateurAdmin,
          idUtilisateurAdministre: idUtilisateurCible,
          idsServices: [idService],
        };
        // @ts-expect-error On supprime la propriété
        delete payload[proprieteObligatoire];

        await expect(
          traceAccesUtilisateurAdministreRetiresDansAudit({
            depotDonnees,
            adaptateurAuditAdminOrganisations,
          })(payload)
        ).rejects.toThrow(
          `Impossible de tracer un retrait d'accès à un utilisateur administré sans avoir ${proprieteObligatoire} en paramètre.`
        );
      }
    );
  });
});

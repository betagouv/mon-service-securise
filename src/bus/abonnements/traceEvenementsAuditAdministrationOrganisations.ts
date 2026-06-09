import { EvenementAccesUtilisateurAdministreRetires as MssAccesUtilisateurAdministreRetires } from '../evenementAccesUtilisateurAdministreRetires.js';
import { EvenementRoleUtilisateurAdministreAttribue as MssRoleUtilisateurAdministreAttribue } from '../evenementRoleUtilisateurAdministreAttribue.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { AdaptateurAuditAdminOrganisations } from '../../adaptateurs/adaptateurAuditAdminOrganisations.interface.js';
import { UUID } from '../../typesBasiques.js';
import { EvenementAdminNommeSurOrganisation } from '../evenementAdminNommeSurOrganisation.js';
import { EvenementAdminRetireDeOrganisation } from '../evenementAdminRetireDeOrganisation.js';

const leveException = (raison: string, typeEvenement: string) => {
  throw new Error(
    `Impossible de tracer ${typeEvenement} sans avoir ${raison} en paramètre.`
  );
};

export function traceAccesUtilisateurAdministreRetiresDansAudit({
  depotDonnees,
  adaptateurAuditAdminOrganisations,
}: {
  depotDonnees: DepotDonnees;
  adaptateurAuditAdminOrganisations: AdaptateurAuditAdminOrganisations;
}) {
  return async (evenement: MssAccesUtilisateurAdministreRetires) => {
    const { idAdmin, idUtilisateurAdministre, idsServices } = evenement;

    (
      ['idAdmin', 'idUtilisateurAdministre', 'idsServices'] as Array<
        keyof MssAccesUtilisateurAdministreRetires
      >
    ).forEach((id) => {
      if (!evenement[id])
        leveException(id, "un retrait d'accès à un utilisateur administré");
    });

    const admin = await depotDonnees.utilisateur(idAdmin);
    const cible = await depotDonnees.utilisateur(idUtilisateurAdministre);

    const tracePourUnService = async (idService: UUID) => {
      const service = await depotDonnees.service(idService);

      await adaptateurAuditAdminOrganisations.trace({
        acteur: admin!,
        utilisateurCible: cible!,
        entiteCible: service!.descriptionService.organisationResponsable,
        serviceCible: service,
        typeAction: 'RETRAIT_ACCES',
      });
    };

    await Promise.all(idsServices.map(tracePourUnService));
  };
}

export function traceRoleUtilisateurAdministreAttribueDansAudit({
  depotDonnees,
  adaptateurAuditAdminOrganisations,
}: {
  depotDonnees: DepotDonnees;
  adaptateurAuditAdminOrganisations: AdaptateurAuditAdminOrganisations;
}) {
  return async (evenement: MssRoleUtilisateurAdministreAttribue) => {
    const { idAdmin, idUtilisateurAdministre, idsServices, role } = evenement;

    (
      ['idAdmin', 'idUtilisateurAdministre', 'idsServices', 'role'] as Array<
        keyof MssRoleUtilisateurAdministreAttribue
      >
    ).forEach((id) => {
      if (!evenement[id])
        leveException(
          id,
          'une attribution de rôle à un utilisateur administré'
        );
    });

    const admin = await depotDonnees.utilisateur(idAdmin);
    const cible = await depotDonnees.utilisateur(idUtilisateurAdministre);

    const tracePourUnService = async (idService: UUID) => {
      const service = await depotDonnees.service(idService);

      await adaptateurAuditAdminOrganisations.trace({
        acteur: admin!,
        utilisateurCible: cible!,
        entiteCible: service!.descriptionService.organisationResponsable,
        serviceCible: service,
        typeAction: 'ATTRIBUTION_ROLE',
        donneesSupplementaires: { role },
      });
    };

    await Promise.all(idsServices.map(tracePourUnService));
  };
}

const traceModificationPerimetreAdminDansAudit =
  ({
    depotDonnees,
    adaptateurAuditAdminOrganisations,
    typeAction,
    descriptionTypeAction,
  }: {
    depotDonnees: DepotDonnees;
    adaptateurAuditAdminOrganisations: AdaptateurAuditAdminOrganisations;
    typeAction: 'NOMINATION_ADMIN' | 'RETRAIT_ADMIN';
    descriptionTypeAction: string;
  }) =>
  async (
    evenement:
      | EvenementAdminNommeSurOrganisation
      | EvenementAdminRetireDeOrganisation
  ) => {
    const { idCible, idActeur, siret } = evenement;

    (
      ['idCible', 'idActeur', 'siret'] as Array<
        | keyof EvenementAdminNommeSurOrganisation
        | keyof EvenementAdminRetireDeOrganisation
      >
    ).forEach((id) => {
      if (!evenement[id]) leveException(id, descriptionTypeAction);
    });

    const admin = await depotDonnees.utilisateur(idActeur);
    const cible = await depotDonnees.utilisateur(idCible);

    await adaptateurAuditAdminOrganisations.trace({
      acteur: admin!,
      utilisateurCible: cible!,
      entiteCible: { siret },
      typeAction,
    });
  };

export function traceNominationAdminSurOrganisationDansAudit({
  depotDonnees,
  adaptateurAuditAdminOrganisations,
}: {
  depotDonnees: DepotDonnees;
  adaptateurAuditAdminOrganisations: AdaptateurAuditAdminOrganisations;
}) {
  return traceModificationPerimetreAdminDansAudit({
    depotDonnees,
    adaptateurAuditAdminOrganisations,
    typeAction: 'NOMINATION_ADMIN',
    descriptionTypeAction: "une nomination d'admin",
  });
}

export function traceRetraitAdminDeOrganisationDansAudit({
  depotDonnees,
  adaptateurAuditAdminOrganisations,
}: {
  depotDonnees: DepotDonnees;
  adaptateurAuditAdminOrganisations: AdaptateurAuditAdminOrganisations;
}) {
  return traceModificationPerimetreAdminDansAudit({
    depotDonnees,
    adaptateurAuditAdminOrganisations,
    typeAction: 'RETRAIT_ADMIN',
    descriptionTypeAction: "un retrait d'admin",
  });
}

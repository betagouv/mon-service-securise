import { EvenementAccesUtilisateurAdministreRetires as MssAccesUtilisateurAdministreRetires } from '../evenementAccesUtilisateurAdministreRetires.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { AdaptateurAuditAdminOrganisations } from '../../adaptateurs/adaptateurAuditAdminOrganisations.interface.js';
import { UUID } from '../../typesBasiques.js';

const leveException = (raison: keyof MssAccesUtilisateurAdministreRetires) => {
  throw new Error(
    `Impossible de tracer un retrait d'accès à un utilisateur administré sans avoir ${raison} en paramètre.`
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

    if (!idAdmin) leveException('idAdmin');
    if (!idUtilisateurAdministre) leveException('idUtilisateurAdministre');
    if (!idsServices) leveException('idsServices');

    const admin = await depotDonnees.utilisateur(evenement.idAdmin);
    const cible = await depotDonnees.utilisateur(
      evenement.idUtilisateurAdministre
    );

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

import Dossiers from '../dossiers.js';
import { Autorisation } from '../autorisations/autorisation.js';

const {
  DROITS_VOIR_STATUT_HOMOLOGATION,
  DROITS_VOIR_DESCRIPTION,
  DROITS_VOIR_MESURES,
} = Autorisation;

const donnees = (
  service,
  autorisation,
  referentiel,
  adaptateurEnvironnement
) => {
  const enCoursEdition =
    service.dossiers.statutSaisie() === Dossiers.A_COMPLETER;
  const etapeCouranteAutorisee = referentiel.etapeDossierAutorisee(
    service.dossiers.dossierCourant()?.etapeCourante(),
    autorisation.peutHomologuer()
  );
  const dateExpiration = service.dossiers.dateExpiration();
  const completude = service.completudeMesures();
  const actionRecommandee = service.actionRecommandee(adaptateurEnvironnement);
  return {
    id: service.id,
    nomService: service.nomService(),
    organisationResponsable:
      service.descriptionService.organisationResponsable.nom ?? '',
    contributeurs: service.contributeurs.map((c) => ({
      id: c.idUtilisateur,
      prenomNom: c.prenomNom(),
      initiales: c.initiales(),
      poste: c.posteDetaille(),
      estUtilisateurCourant: autorisation.designeUtilisateur(c.idUtilisateur),
    })),
    ...(autorisation.aLesPermissions(DROITS_VOIR_STATUT_HOMOLOGATION) && {
      statutHomologation: {
        id: service.dossiers.statutHomologation(),
        enCoursEdition,
        ...(dateExpiration && { dateExpiration }),
        ...(enCoursEdition && { etapeCourante: etapeCouranteAutorisee }),
        ...referentiel.statutHomologation(
          service.dossiers.statutHomologation()
        ),
      },
    }),
    nombreContributeurs: service.contributeurs.length,
    estProprietaire: autorisation.estProprietaire,
    documentsPdfDisponibles: service.documentsPdfDisponibles(autorisation),
    permissions: {
      gestionContributeurs: autorisation.peutGererContributeurs(),
    },
    aUneSuggestionAction: !!service.aUneSuggestionDAction(),
    ...(actionRecommandee && {
      actionRecommandee: {
        id: actionRecommandee.id,
        autorisee: autorisation.peutFaireActionRecommandee(actionRecommandee),
      },
    }),
    ...(autorisation.aLesPermissions(DROITS_VOIR_DESCRIPTION) && {
      niveauSecurite: service.descriptionService.niveauSecurite,
    }),
    ...(autorisation.aLesPermissions(DROITS_VOIR_MESURES) && {
      pourcentageCompletude:
        completude.nombreMesuresCompletes / completude.nombreTotalMesures || 0,
    }),
  };
};

export { donnees };

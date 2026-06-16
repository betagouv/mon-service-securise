import { AdaptateurPersistanceMemoireTS } from './adaptateurPersistanceMemoireTS.js';
import Superviseur from '../modeles/superviseur.js';
import { AdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { donneesTestsAccessibilite } from '../../test_accessibilite/donneesTestAccessibilite.js';

export const nouvelAdaptateur = () => {
  const { utilisateurSuperviseur, utilisateurAdmin, entite } =
    donneesTestsAccessibilite;

  const persistance = new AdaptateurPersistanceMemoireTS();

  persistance.sauvegardeSuperviseur(
    Superviseur.hydrate({
      idUtilisateur: utilisateurSuperviseur.id,
      entitesSupervisees: [entite],
    }).donnees()
  );
  persistance.sauvegardeAdminOrganisations(
    AdminOrganisations.hydrate({
      idUtilisateur: utilisateurAdmin.id,
      entitesAdministrees: [entite],
    }).donnees()
  );

  return persistance;
};

import { AdaptateurPersistanceMemoireTS } from './adaptateurPersistanceMemoireTS.js';
import Superviseur from '../modeles/superviseur.js';
import { AdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { donneesTestsAccessibilite } from '../../test_accessibilite/donneesTestAccessibilite.js';

export const nouvelAdaptateur = () => {
  const { utilisateurSuperviseur, utilisateurAdmin, siret } =
    donneesTestsAccessibilite;

  const persistance = new AdaptateurPersistanceMemoireTS();

  persistance.sauvegardeSuperviseur(
    Superviseur.hydrate({
      idUtilisateur: utilisateurSuperviseur.id,
      entitesSupervisees: [{ siret }],
    }).donnees()
  );
  persistance.sauvegardeAdminOrganisations(
    AdminOrganisations.hydrate({
      idUtilisateur: utilisateurAdmin.id,
      entitesAdministrees: [{ siret }],
    }).donnees()
  );

  return persistance;
};

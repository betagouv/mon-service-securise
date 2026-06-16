import { AdaptateurPersistanceMemoireTS } from './adaptateurPersistanceMemoireTS.js';
import Superviseur from '../modeles/superviseur.js';
import { AdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { UUID } from '../typesBasiques.js';

export const nouvelAdaptateur = () => {
  const siret = process.env.ACCESSIBILITE_SIRET!;
  const idSuperviseur = process.env.ACCESSIBILITE_ID_SUPERVISEUR! as UUID;
  const idAdmin = process.env.ACCESSIBILITE_ID_ADMIN! as UUID;

  const persistance = new AdaptateurPersistanceMemoireTS();

  persistance.sauvegardeSuperviseur(
    Superviseur.hydrate({
      idUtilisateur: idSuperviseur,
      entitesSupervisees: [{ siret }],
    }).donnees()
  );
  persistance.sauvegardeAdminOrganisations(
    AdminOrganisations.hydrate({
      idUtilisateur: idAdmin,
      entitesAdministrees: [{ siret }],
    }).donnees()
  );

  return persistance;
};

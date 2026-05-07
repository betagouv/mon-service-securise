import { AdaptateurPersistance } from '../adaptateurs/adaptateurPersistance.interface.js';
import { UUID } from '../typesBasiques.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import { DepotDonneesAdministrationOrganisations } from './depotDonneesAdministrationOrganisations.interface.js';
import Entite, { DonneesEntite } from '../modeles/entite.js';
import { DepotDonneesSuperviseurs } from './depotDonneesSuperviseurs.interface.js';

export const creeDepot = ({
  persistance,
  chiffrement,
  depotSuperviseurs,
}: {
  persistance: AdaptateurPersistance;
  chiffrement: AdaptateurChiffrement;
  depotSuperviseurs: DepotDonneesSuperviseurs;
}): DepotDonneesAdministrationOrganisations => {
  const lisAdminsPour = async (siret: string): Promise<Array<UUID>> => {
    const siretHache = chiffrement.hacheSha256(siret);
    return persistance.lisAdminsPour(siretHache);
  };

  const entitesAdministreesPar = async (
    idUtilisateur: UUID
  ): Promise<Array<Entite>> => {
    const estSuperviseur =
      await depotSuperviseurs.estSuperviseur(idUtilisateur);
    if (estSuperviseur) {
      const superviseur = await depotSuperviseurs.superviseur(idUtilisateur);
      return superviseur.entitesSupervisees;
    }

    const donneesEntites =
      await persistance.lisEntitesAdministreesPar(idUtilisateur);
    return donneesEntites.map(
      (donneesEntite: DonneesEntite) => new Entite(donneesEntite)
    );
  };

  return { lisAdminsPour, entitesAdministreesPar };
};

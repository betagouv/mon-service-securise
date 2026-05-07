import { AdaptateurPersistance } from '../adaptateurs/adaptateurPersistance.interface.js';
import { UUID } from '../typesBasiques.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import { DepotDonneesAdministrationOrganisations } from './depotDonneesAdministrationOrganisations.interface.js';
import Entite, { DonneesEntite } from '../modeles/entite.js';
import { DepotDonneesSuperviseurs } from './depotDonneesSuperviseurs.interface.js';
import { AdaptateurRechercheEntreprise } from '../adaptateurs/adaptateurRechercheEntreprise.interface.js';

export const creeDepot = ({
  persistance,
  chiffrement,
  depotSuperviseurs,
  adaptateurRechercheEntite,
}: {
  persistance: AdaptateurPersistance;
  chiffrement: AdaptateurChiffrement;
  depotSuperviseurs: DepotDonneesSuperviseurs;
  adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
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
      return superviseur!.entitesSupervisees;
    }

    const donneesChiffrees =
      await persistance.lisEntitesAdministreesPar(idUtilisateur);
    const donneesEntites = await Promise.all<DonneesEntite>(
      donneesChiffrees.map(chiffrement.dechiffre)
    );
    return donneesEntites.map((donneesEntite) => new Entite(donneesEntite));
  };

  const ajouteSiretAAdmin = async (idAdmin: UUID, siret: string) => {
    const entite = await Entite.completeDonnees(
      { siret },
      adaptateurRechercheEntite
    );

    const siretHache = chiffrement.hacheSha256(siret);
    const donneesChiffrees = await chiffrement.chiffre(entite);

    return persistance.ajouteEntiteAAdmin(
      idAdmin,
      siretHache,
      donneesChiffrees
    );
  };

  return { lisAdminsPour, entitesAdministreesPar, ajouteSiretAAdmin };
};

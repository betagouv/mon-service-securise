import { UUID } from '../typesBasiques.js';
import Utilisateur from '../modeles/utilisateur.js';

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

export type DonneesRapportMensuel = {
  email: string;
  nbNouveauxServicesDansPerimetre: number;
};

type Configuration = {
  depotDonnees: {
    tousLesIdsAdmins: () => Promise<UUID[]>;
    tousLesIdsSuperviseurs: () => Promise<UUID[]>;
    utilisateur: (id: UUID) => Promise<Utilisateur>;
  };
};
export class RapportMensuel {
  private readonly depotDonnees;

  constructor(config: Configuration) {
    this.depotDonnees = config.depotDonnees;
  }

  async donnees(): Promise<DonneesRapportMensuel[]> {
    const idAdmins = await this.depotDonnees.tousLesIdsAdmins();
    const idsSuperviseurs = await this.depotDonnees.tousLesIdsSuperviseurs();

    const idsUniques = [...new Set([...idAdmins, ...idsSuperviseurs])];
    const utilisateurs = await this.recupereLesUtilisateurs(idsUniques);

    return utilisateurs.map((u) => ({
      email: u.email,
      nbNouveauxServicesDansPerimetre: 0,
    }));
  }

  private async recupereLesUtilisateurs(ids: UUID[]): Promise<Utilisateur[]> {
    const utilisateurs: Utilisateur[] = [];

    for (const id of ids) {
      const utilisateur = await this.depotDonnees.utilisateur(id);
      utilisateurs.push(utilisateur);
    }

    return utilisateurs.filter(
      (u) => u.preferencesRecapitulatif().nouveauxServicesAjoutesAuPerimetre
    );
  }
}

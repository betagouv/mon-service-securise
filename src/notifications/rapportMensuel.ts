import { UUID } from '../typesBasiques.js';
import Utilisateur from '../modeles/utilisateur.js';
import { AdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import Superviseur from '../modeles/superviseur.js';
import Service from '../modeles/service.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import { ServicesSansMesuresAppliquees } from './servicesSansMesuresAppliquees.js';

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */

export type DonneesRapportMensuel = {
  email: string;
  nbNouveauxServicesDansPerimetre: number;
  nbNouveauxServicesSansTousModelesMesureAppliques?: number;
};

export type Configuration = {
  depotDonnees: {
    tousLesAdmins: () => Promise<AdminOrganisations[]>;
    tousLesSuperviseurs: () => Promise<Superviseur[]>;
    utilisateur: (id: UUID) => Promise<Utilisateur | undefined>;
    tousLesServicesAvecSirets: (
      sirets: string[]
    ) => Promise<Map<string, Service[]>>;
  };
  adaptateurJournal: {
    servicesCreesDansIntervalle(
      idsServicesHaches: string[],
      intervalle: { debut: Date; fin: Date }
    ): Promise<Array<string>>;
  };
  adaptateurChiffrement: AdaptateurChiffrement;
  servicesSansMesuresAppliquees: ServicesSansMesuresAppliquees;
};

export class RapportMensuel {
  private readonly depotDonnees;
  private readonly adaptateurJournal;
  private readonly adaptateurChiffrement;
  private readonly servicesSansMesuresAppliquees;

  constructor(config: Configuration) {
    this.depotDonnees = config.depotDonnees;
    this.adaptateurJournal = config.adaptateurJournal;
    this.adaptateurChiffrement = config.adaptateurChiffrement;
    this.servicesSansMesuresAppliquees = config.servicesSansMesuresAppliquees;
  }

  async donnees(intervalle: {
    debut: Date;
    fin: Date;
  }): Promise<DonneesRapportMensuel[]> {
    const admins = await this.depotDonnees.tousLesAdmins();
    const superviseurs = await this.depotDonnees.tousLesSuperviseurs();
    const idAdmins = admins.map((admin) => admin.donnees().idUtilisateur);
    const idsSuperviseurs = superviseurs.map(
      (superviseur) => superviseur.donnees().idUtilisateur
    );

    const idsUniques = [...new Set([...idAdmins, ...idsSuperviseurs])];
    const utilisateurs = await this.recupereLesUtilisateurs(idsUniques);

    const resultat: DonneesRapportMensuel[] = [];

    for (const utilisateur of utilisateurs) {
      const perimetre = this.#perimetreUtilisateur(
        utilisateur,
        admins,
        superviseurs
      );

      const services =
        await this.depotDonnees.tousLesServicesAvecSirets(perimetre);

      const serviceViaIdHache = Object.fromEntries(
        [...services.values().flatMap((s) => s)].map((s) => [
          this.adaptateurChiffrement.hacheSha256(s.id),
          s,
        ])
      );

      const idHachesServicesNouveauxDansIntervalle =
        await this.adaptateurJournal.servicesCreesDansIntervalle(
          Object.keys(serviceViaIdHache),
          intervalle
        );

      if (idHachesServicesNouveauxDansIntervalle.length > 0) {
        const ligne: DonneesRapportMensuel = {
          email: utilisateur.email,
          nbNouveauxServicesDansPerimetre:
            idHachesServicesNouveauxDansIntervalle.length,
        };

        if (
          utilisateur.preferencesRecapitulatif()
            .nouveauxServicesSansToutesMesuresSpecifiques
        ) {
          const servicesNouveauxDansIntervalle =
            idHachesServicesNouveauxDansIntervalle.map(
              (idHache) => serviceViaIdHache[idHache]
            );

          const servicesSansTousModelesAppliques =
            await this.servicesSansMesuresAppliquees.calculePour(
              utilisateur.id,
              servicesNouveauxDansIntervalle
            );

          ligne.nbNouveauxServicesSansTousModelesMesureAppliques =
            servicesSansTousModelesAppliques.length;
        }
        resultat.push(ligne);
      }
    }

    return resultat;
  }

  private async recupereLesUtilisateurs(ids: UUID[]): Promise<Utilisateur[]> {
    const utilisateurs: Utilisateur[] = [];

    for (const id of ids) {
      const utilisateur = await this.depotDonnees.utilisateur(id);
      utilisateurs.push(utilisateur!);
    }

    return utilisateurs.filter(
      (u) => u.preferencesRecapitulatif().nouveauxServicesAjoutesAuPerimetre
    );
  }

  #perimetreUtilisateur(
    utilisateur: Utilisateur,
    admins: AdminOrganisations[],
    superviseurs: Superviseur[]
  ): string[] {
    const perimetre = [];

    const admin = admins.find(
      (a) => a.donnees().idUtilisateur === utilisateur.id
    );
    if (admin)
      perimetre.push(
        ...admin!.donnees().entitesAdministrees.map((e) => e.siret)
      );

    const superviseur = superviseurs.find(
      (s) => s.donnees().idUtilisateur === utilisateur.id
    );
    if (superviseur)
      perimetre.push(
        ...superviseur!.donnees().entitesSupervisees.map((e) => e.siret)
      );

    return perimetre;
  }
}

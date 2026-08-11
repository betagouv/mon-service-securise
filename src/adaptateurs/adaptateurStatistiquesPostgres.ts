import Knex from 'knex';
import {
  AdaptateurStatistiques,
  NombrePourStatistiquesPubliques,
} from './adaptateurStatistiques.interface.js';

export class AdaptateurStatistiquesPostgres implements AdaptateurStatistiques {
  private readonly knex: Knex.Knex;
  private readonly knexJournal: Knex.Knex;

  constructor({
    knex,
    knexJournal,
  }: {
    knex: Knex.Knex;
    knexJournal: Knex.Knex;
  }) {
    this.knex = knex;
    this.knexJournal = knexJournal;
  }

  private async nombreUtilisateurs(): Promise<NombrePourStatistiquesPubliques> {
    const idUtilisateur = this.knexJournal.raw("donnees->>'idUtilisateur'");

    const inscriptions = this.knexJournal('journal_mss.evenements')
      .select({ idUtilisateur })
      .where('type', 'NOUVEL_UTILISATEUR_INSCRIT')
      .as('creation');

    const acceptationsCGU = this.knexJournal('journal_mss.evenements')
      .select({ idUtilisateur })
      .where('type', 'CGU_ACCEPTEES')
      .groupBy(idUtilisateur)
      .as('acceptation');

    return (
      await this.knexJournal
        .from(inscriptions)
        .innerJoin(
          acceptationsCGU,
          'creation.idUtilisateur',
          'acceptation.idUtilisateur'
        )
        .count('* as nombre')
    )[0] as NombrePourStatistiquesPubliques;
  }

  private async nombreServices(): Promise<NombrePourStatistiquesPubliques> {
    return (
      await this.knex('services').count('* as nombre')
    )[0] as NombrePourStatistiquesPubliques;
  }

  private async nombreVulnerabilites(): Promise<NombrePourStatistiquesPubliques> {
    return (
      await this.knexJournal('journal_mss.donnees_statuts_des_mesures')
        .whereIn('statut', ['fait', 'enCours'])
        .count('* as nombre')
    )[0] as NombrePourStatistiquesPubliques;
  }

  async recupereStatistiques() {
    const utilisateurs = await this.nombreUtilisateurs();
    const services = await this.nombreServices();
    const vulnerabilites = await this.nombreVulnerabilites();

    return {
      utilisateurs,
      services,
      vulnerabilites,
    };
  }
}

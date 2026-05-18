import Knex from 'knex';
import { UUID } from 'node:crypto';
import { DonneesAdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { DonneesEntite } from '../modeles/entite.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { PersistanceTS } from './persistanceTS.interface.js';

enum TABLES {
  ADMINS_ORGANISATIONS = 'admins_organisations',
}

export class AdaptateurPostgresTS implements PersistanceTS {
  private readonly knex: Knex.Knex;
  private readonly chiffrement: AdaptateurChiffrement;

  constructor({
    knex,
    chiffrement,
  }: {
    knex: Knex.Knex;
    chiffrement: AdaptateurChiffrement;
  }) {
    this.knex = knex;
    this.chiffrement = chiffrement;
  }

  async lisAdminOrganisations(
    idUtilisateur: UUID
  ): Promise<DonneesAdminOrganisations | undefined> {
    const chaqueLigne = await this.knex(TABLES.ADMINS_ORGANISATIONS)
      .select({ donnees: 'donnees' })
      .where({ id_utilisateur: idUtilisateur });

    if (chaqueLigne.length === 0) return undefined;

    const entitesDechiffrees = await Promise.all<DonneesEntite>(
      chaqueLigne.map((c) => this.chiffrement.dechiffre(c.donnees))
    );

    return { idUtilisateur, entitesAdministrees: entitesDechiffrees };
  }

  async lisAdminsOrganisation(
    siret: string
  ): Promise<Array<DonneesAdminOrganisations>> {
    const siretHache = this.chiffrement.hacheSha256(siret);
    const chaqueLigne: { idUtilisateur: UUID }[] = await this.knex(
      TABLES.ADMINS_ORGANISATIONS
    )
      .select({ idUtilisateur: 'id_utilisateur' })
      .where({ siret_hash: siretHache });

    return Promise.all(
      chaqueLigne.map(
        ({ idUtilisateur }) =>
          this.lisAdminOrganisations(
            idUtilisateur
          ) as unknown as DonneesAdminOrganisations
      )
    );
  }
}

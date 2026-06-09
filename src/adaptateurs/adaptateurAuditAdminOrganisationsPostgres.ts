import Knex from 'knex';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import {
  TraceAudit,
  TypeActionAudit,
} from '../modeles/gestionOrganisations/traceAudit.js';

export class AdaptateurAuditAdminOrganisationsPostgres {
  private readonly knex: Knex.Knex;
  private readonly adaptateurChiffrement: AdaptateurChiffrement;

  constructor({
    knex,
    adaptateurChiffrement,
  }: {
    knex: Knex.Knex;
    adaptateurChiffrement: AdaptateurChiffrement;
  }) {
    this.knex = knex;
    this.adaptateurChiffrement = adaptateurChiffrement;
  }

  async trace<T extends TypeActionAudit>(evenement: TraceAudit<T>) {
    const donneesChiffrees = await this.adaptateurChiffrement.chiffre({
      siret: evenement.entiteCible.siret,
      emailActeur: evenement.acteur.email,
      emailCible: evenement.utilisateurCible.email,
      ...evenement.donneesSupplementaires,
    });
    await this.knex('admins_organisations_audit').insert({
      id_acteur: evenement.acteur.id,
      email_acteur_hash: this.adaptateurChiffrement.hacheSha256(
        evenement.acteur.email
      ),
      id_utilisateur_cible: evenement.utilisateurCible.id,
      email_utilisateur_cible_hash: this.adaptateurChiffrement.hacheSha256(
        evenement.utilisateurCible.email
      ),
      type_action: evenement.typeAction,
      siret_hash: this.adaptateurChiffrement.hacheSha256(
        evenement.entiteCible.siret
      ),
      id_service_cible: evenement.serviceCible?.id,
      donnees: donneesChiffrees,
    });
  }
}

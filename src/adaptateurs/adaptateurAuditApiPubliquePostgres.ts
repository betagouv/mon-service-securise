import Knex from 'knex';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import {
  AdaptateurAuditApiPublique,
  TraceAuditApiPublique,
} from './adaptateurAuditApiPublique.interface.js';

export class AdaptateurAuditApiPubliquePostgres implements AdaptateurAuditApiPublique {
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

  async trace(trace: TraceAuditApiPublique) {
    await this.knex('api_publique_audit').insert({
      id_cle_api: trace.idCleApi,
      id_utilisateur: trace.idUtilisateur,
      route: trace.route,
      adresse_ip: await this.adaptateurChiffrement.chiffre(trace.adresseIp),
    });
  }
}

import Service from '../../modeles/service.js';
import { AdaptateurChiffrement } from '../adaptateurChiffrement.interface.js';
import {
  AdaptateurJournalMSS,
  EvolutionMensuelle,
} from '../adaptateurJournalMSS.interface.js';

export class EvolutionNombreServices {
  constructor(
    private readonly configuration: {
      adaptateurChiffrement: AdaptateurChiffrement;
      adaptateurJournalMSS: AdaptateurJournalMSS;
    }
  ) {}

  async donnees(services: Array<Service>): Promise<EvolutionMensuelle> {
    const { adaptateurChiffrement, adaptateurJournalMSS } = this.configuration;

    const idsHaches = services.map((s) =>
      adaptateurChiffrement.hacheSha256(s.id)
    );

    return adaptateurJournalMSS.evolutionNombreServices(idsHaches);
  }
}

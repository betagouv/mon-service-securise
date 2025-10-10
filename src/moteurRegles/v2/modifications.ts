import { BesoinsDeSecurite, Modificateur } from './moteurReglesV2.js';
import { NiveauSecurite } from '../../../donneesReferentielMesuresV2.js';

export class Modifications {
  private modificateurs: Modificateur[];

  constructor(
    private readonly dansSocleInitial: boolean,
    private readonly besoinsDeSecurite: BesoinsDeSecurite,
    private readonly niveauDeSecuriteDuService: NiveauSecurite
  ) {
    this.modificateurs = [];
  }

  ajoute(modificateur: Modificateur) {
    this.modificateurs.push(modificateur);
  }

  doitAjouter() {
    const nonExclue =
      this.dansSocleInitial && !this.modificateurs.includes('Retirer');
    return nonExclue || this.modificateurs.includes('Ajouter');
  }

  rendreIndispensable() {
    const besoinDuNiveauDuService =
      this.besoinsDeSecurite[this.niveauDeSecuriteDuService];

    if (
      besoinDuNiveauDuService === 'Indispensable' &&
      this.modificateurs.includes('RendreRecommandee')
    )
      return false;

    return (
      besoinDuNiveauDuService === 'Indispensable' ||
      this.modificateurs.includes('RendreIndispensable')
    );
  }
}

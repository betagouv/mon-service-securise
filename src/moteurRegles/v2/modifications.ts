import { BesoinsDeSecurite, Modificateur } from './moteurReglesV2.js';
import { NiveauSecurite } from '../../../donneesReferentielMesuresV2.js';

export type PartieResponsable = 'Presta' | 'Projet' | 'Mixte';

export class Modifications {
  private modificateurs: Modificateur[];

  constructor(
    private readonly dansSocleInitial: boolean,
    private readonly besoinsDeSecurite: BesoinsDeSecurite,
    private readonly niveauDeSecuriteDuService: NiveauSecurite
  ) {
    this.modificateurs = [];
  }

  ajoute(modificateurs: Modificateur[]) {
    this.modificateurs.push(...modificateurs);
  }

  doitAjouter() {
    const nonExclue =
      this.dansSocleInitial && !this.modificateurs.includes('Retirer');
    return nonExclue || this.modificateurs.includes('Ajouter');
  }

  partieResponsable(): PartieResponsable | undefined {
    const sansDoublons = new Set(
      this.modificateurs.filter(
        (m) => m === 'Presta' || m === 'Projet' || m === 'Mixte'
      )
    );

    if (sansDoublons.has('Presta') && sansDoublons.has('Projet'))
      return 'Mixte';
    if (sansDoublons.has('Mixte')) return 'Mixte';
    if (sansDoublons.has('Projet')) return 'Projet';
    if (sansDoublons.has('Presta')) return 'Presta';

    return undefined;
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

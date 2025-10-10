import { Modifications } from './modifications.js';
import {
  BesoinsDeSecurite,
  CaracteristiquesDuService,
  ModificateursDeRegles,
} from './moteurReglesV2.js';
import { NiveauSecurite } from '../../../donneesReferentielMesuresV2.js';

export class RegleV2 {
  constructor(
    readonly reference: string,
    private readonly besoinsAssocies: BesoinsDeSecurite,
    private readonly dansSocleInitial: boolean,
    private readonly modificateurs: ModificateursDeRegles // eslint-disable-next-line no-empty-function
  ) {}

  public estPourNiveau(niveau: NiveauSecurite) {
    return this.besoinsAssocies[niveau] !== 'Absente';
  }

  public evalue(descriptionService: Record<string, string>): Modifications {
    const collecte = new Modifications(
      this.dansSocleInitial,
      this.besoinsAssocies,
      descriptionService.niveauDeSecurite as NiveauSecurite
    );

    Object.keys(this.modificateurs).forEach((champDeDecrire) => {
      const modifications =
        this.modificateurs[champDeDecrire as CaracteristiquesDuService];
      for (let i = 0; i < modifications!.length; i += 1) {
        const [valeurRegle, modificateur] = modifications![i];

        const valeurReelle = descriptionService[champDeDecrire];

        if (Array.isArray(valeurReelle) && valeurReelle.includes(valeurRegle))
          collecte.ajoute(modificateur);
        else if (valeurReelle === valeurRegle) collecte.ajoute(modificateur);
      }
    });

    return collecte;
  }
}

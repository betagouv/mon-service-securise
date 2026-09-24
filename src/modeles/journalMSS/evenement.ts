import { AdaptateurChiffrement } from '../../adaptateurs/adaptateurChiffrement.interface.js';
import { fabriqueAdaptateurChiffrement } from '../../adaptateurs/fabriqueAdaptateurChiffrement.js';
import { EvenementJournal } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import { ErreurDonneesObligatoiresManquantes } from '../../erreurs.js';

export type Hacheur = AdaptateurChiffrement['hacheSha256'];
export type DateEvenement = EvenementJournal['date'];
export type OptionsEvenement = {
  date?: DateEvenement;
  adaptateurChiffrement?: Pick<AdaptateurChiffrement, 'hacheSha256'>;
};

const manque = (valeur: unknown) => valeur === undefined || valeur === null;

abstract class Evenement<Donnees> {
  readonly type: string;
  readonly donnees: Record<string, unknown>;
  readonly date: DateEvenement;

  constructor(donnees: Donnees, options: OptionsEvenement = {}) {
    this.valide(donnees);

    const { hacheSha256 } =
      options.adaptateurChiffrement ?? fabriqueAdaptateurChiffrement();

    this.type = this.typeEvenement();
    this.donnees = this.donneesAConsigner(donnees, hacheSha256);
    this.date = options.date ?? Date.now();
  }

  protected abstract typeEvenement(): string;

  protected abstract donneesAConsigner(
    donnees: Donnees,
    hache: Hacheur
  ): Record<string, unknown>;

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected proprietesRequises(donnees: Donnees): (keyof Donnees)[] {
    return [];
  }

  protected valide(donnees: Donnees) {
    this.proprietesRequises(donnees).forEach((requise) => {
      if (manque(donnees?.[requise]))
        throw new ErreurDonneesObligatoiresManquantes(
          `Il manque la donnée ${String(requise)}`
        );
    });
  }

  toJSON(): EvenementJournal {
    return {
      type: this.type,
      donnees: this.donnees,
      date: this.date,
    };
  }
}

export default Evenement;

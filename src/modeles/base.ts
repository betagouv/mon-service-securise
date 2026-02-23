import type { Referentiel } from '../referentiel.interface.js';

const proprietePresente = (valeur: unknown): boolean => {
  if (Array.isArray(valeur)) {
    return valeur.length > 0 && valeur.every((item) => proprietePresente(item));
  }

  switch (typeof valeur) {
    case 'undefined':
      return false;
    case 'boolean':
      return true;
    case 'string':
      return valeur.length > 0;
    case 'number':
      return !Number.isNaN(valeur);
    case 'object':
      return valeur !== null && Object.keys(valeur).length !== 0;
    default:
      return false;
  }
};

type ConstructeurAgregat = new (
  donnees: Record<string, unknown>,
  referentiel?: Referentiel
  // eslint-disable-next-line no-use-before-define
) => Base;

export type ProprietesBase = {
  proprietesAtomiquesRequises?: string[];
  proprietesAtomiquesFacultatives?: string[];
  proprietesListes?: string[];
  listesAgregats?: Record<string, ConstructeurAgregat>;
};

abstract class Base {
  protected readonly proprietesAtomiquesRequises: string[];
  protected readonly proprietesAtomiquesFacultatives: string[];
  protected readonly proprietesListes: string[];
  protected readonly listesAgregats: Record<string, ConstructeurAgregat>;
  [key: string]: unknown;

  constructor({
    proprietesAtomiquesRequises = [],
    proprietesAtomiquesFacultatives = [],
    proprietesListes = [],
    listesAgregats = {},
  }: ProprietesBase = {}) {
    this.proprietesAtomiquesRequises = proprietesAtomiquesRequises;
    this.proprietesAtomiquesFacultatives = proprietesAtomiquesFacultatives;
    this.proprietesListes = proprietesListes;
    this.listesAgregats = listesAgregats;
  }

  aucuneProprieteAtomiqueRequise() {
    return this.proprietesAtomiquesRequises.length === 0;
  }

  donneesSerialisees() {
    return this.toJSON();
  }

  renseigneProprietes(
    donnees: Record<string, unknown>,
    referentiel?: Referentiel
  ) {
    [
      ...this.proprietesAtomiquesRequises,
      ...this.proprietesAtomiquesFacultatives,
    ].forEach((p) => {
      this[p] = donnees[p];
    });

    this.proprietesListes.forEach((p) => {
      this[p] = donnees[p] || [];
    });

    Object.keys(this.listesAgregats).forEach((l) => {
      const ClasseListeAgregats = this.listesAgregats[l];
      const donneesListeAgregat = { [l]: donnees[l] || [] };
      this[l] = new ClasseListeAgregats(donneesListeAgregat, referentiel);
    });
  }

  proprieteSaisie(nomPropriete: string) {
    const valeur = this[nomPropriete];
    if (typeof valeur === 'string') return valeur !== '';
    return typeof valeur !== 'undefined';
  }

  toJSON(): object {
    const resultat: Record<string, unknown> = {};

    [
      ...this.proprietesAtomiquesRequises,
      ...this.proprietesAtomiquesFacultatives,
      ...this.proprietesListes,
    ]
      .filter((k) => typeof this[k] !== 'undefined')
      .forEach((k) => {
        resultat[k] = this[k];
      });

    Object.keys(this.listesAgregats).forEach((l) => {
      Object.assign(resultat, { [l]: (this[l] as Base).toJSON() });
    });

    return resultat;
  }

  static proprietesObligatoires(): string[] {
    return [];
  }

  static proprietesObligatoiresRenseignees(donnees: Record<string, unknown>) {
    return this.proprietesObligatoires().every((propriete) =>
      proprietePresente(donnees?.[propriete])
    );
  }
}

export default Base;

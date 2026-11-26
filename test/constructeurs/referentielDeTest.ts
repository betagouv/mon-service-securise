import { DonneesReferentiel } from '../../src/referentiel.types.js';
import { DonneesReferentielV2 } from '../../src/referentielV2.js';

// Ce référentiel de test permet de garder la hiérachie et les clés de nos vraies données de référentiel,
// en remplaçant recursivement les types des valeurs par leur type primitif
// exemple : une `categorieMesure` garde sa clé, mais peut devenir n'importe quelle string

type Primitive = string | number | boolean;

type PrimitiveElargie<T extends Primitive> = T extends string
  ? string
  : T extends number
    ? number
    : boolean;

type Dictionnaire = Record<string, string> | Record<string, object>;

type Elargi<T> = T extends Primitive
  ? PrimitiveElargie<T>
  : T extends readonly (infer Element)[]
    ? Elargi<Element>[]
    : T extends Dictionnaire
      ? Record<string, Elargi<T[keyof T]>>
      : { [Cle in keyof T]?: Elargi<T[Cle]> };

export type DonneesReferentielDeTest = {
  [Section in keyof DonneesReferentiel]?: Elargi<DonneesReferentiel[Section]>;
};

export const donneesReferentielDeTest = (
  donnees: DonneesReferentielDeTest
): DonneesReferentiel => donnees as unknown as DonneesReferentiel;

export type DonneesReferentielV2DeTest = {
  [Section in keyof DonneesReferentielV2]?: Elargi<
    DonneesReferentielV2[Section]
  >;
};

export const donneesReferentielV2DeTest = (
  donnees: DonneesReferentielV2DeTest
): DonneesReferentielV2 => donnees as unknown as DonneesReferentielV2;

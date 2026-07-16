export type OptionListeDeroulante<T> = { label: string; valeur: T };

export type OptionsListeDeroulante<T> = OptionListeDeroulante<T>[];

type IdCategorie = string;
export type OptionsListeDeroulanteRiche<T> = {
  categories: { id: IdCategorie; libelle: string }[];
  items: { libelle: string; valeur: T; idCategorie: IdCategorie }[];
  predicats?: Record<
    IdCategorie,
    (filtreSelectionne: T[], donnee: object) => boolean
  >;
};

export type ItemFilAriane = { label: string; lien?: string };

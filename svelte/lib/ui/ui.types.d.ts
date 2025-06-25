export type OptionListeDeroulante<T> = {
  label: string;
  valeur: T;
};

export type OptionsListeDeroulante<T> = OptionListeDeroulante<T>[];

export type OptionsListeDeroulanteRiche<T> = {
  categories: {
    id: string;
    libelle: string;
  }[];
  items: {
    libelle: string;
    valeur: T;
    idCategorie: string;
  }[];
};

export type ItemFilAriane = {
  label: string;
  lien?: string;
};

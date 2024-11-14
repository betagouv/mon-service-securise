export type OptionListeDeroulante<T> = {
  label: string;
  valeur: T;
};

export type OptionsListeDeroulante<T> = OptionListeDeroulante<T>[];

export type ItemFilAriane = {
  label: string;
  lien?: string;
};

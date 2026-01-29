export interface Identite {
  nom: string;
  prenom: string;
  email: string;
  siret?: string;
}

export interface FournisseurIdentite<
  TIdentifiantRecuperation,
  TIdentite = Identite,
> {
  recupere: (
    identifiantRecuperation: TIdentifiantRecuperation
  ) => Promise<TIdentite | undefined>;
  metsAJour: (identite: TIdentite) => Promise<void>;
}

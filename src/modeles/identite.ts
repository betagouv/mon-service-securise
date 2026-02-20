import { formatteListeFr } from '../utilitaires/liste.js';

export type DonneesIdentite = {
  prenom: string;
  nom: string;
  email: string;
  postes: string[];
};

class Identite {
  private readonly prenom: string;
  private readonly nom: string;
  private readonly email: string;
  private readonly postes: string[];

  constructor(donnees: DonneesIdentite) {
    const { prenom, nom, email, postes } = donnees;
    this.prenom = prenom;
    this.nom = nom;
    this.email = email;
    this.postes = postes;
  }

  initiales() {
    const premiereLettreMajuscule = (s: string | null) =>
      typeof s === 'string' ? s.charAt(0).toUpperCase() : '';

    return (
      `${premiereLettreMajuscule(this.prenom)}${premiereLettreMajuscule(
        this.nom
      )}` || ''
    );
  }

  prenomNom() {
    return [this.prenom, this.nom].join(' ').trim() || this.email;
  }

  posteDetaille() {
    return formatteListeFr(this.postes);
  }
}

export { Identite };

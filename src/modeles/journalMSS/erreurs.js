class ErreurJournal extends Error {}
class ErreurDateDerniereConnexionInvalide extends ErreurJournal {}
class ErreurServiceManquant extends ErreurJournal {}
class ErreurUtilisateurManquant extends ErreurJournal {}
class ErreurDonneeManquante extends ErreurJournal {
  constructor(nomDonneeManquante) {
    super(
      `Il manque la donnée ${nomDonneeManquante} pour instancier l'évènement`
    );
  }
}

export {
  ErreurJournal,
  ErreurDateDerniereConnexionInvalide,
  ErreurDonneeManquante,
  ErreurServiceManquant,
  ErreurUtilisateurManquant,
};

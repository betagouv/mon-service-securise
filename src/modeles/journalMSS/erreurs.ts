/* eslint-disable max-classes-per-file */
class ErreurJournal extends Error {}
class ErreurDateDerniereConnexionInvalide extends ErreurJournal {}
class ErreurDonneeManquante extends ErreurJournal {
  constructor(nomDonneeManquante: string) {
    super(
      `Il manque la donnée ${nomDonneeManquante} pour instancier l'évènement`
    );
  }
}

export {
  ErreurJournal,
  ErreurDateDerniereConnexionInvalide,
  ErreurDonneeManquante,
};

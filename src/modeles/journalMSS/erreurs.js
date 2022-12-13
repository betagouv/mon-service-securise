class ErreurJournal extends Error {}
class ErreurIdentifiantServiceManquant extends ErreurJournal {}
class ErreurIdentifiantUtilisateurManquant extends ErreurJournal {}

module.exports = {
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
};

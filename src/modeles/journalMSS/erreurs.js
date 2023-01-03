class ErreurJournal extends Error {}
class ErreurDetailMesuresManquant extends ErreurJournal {}
class ErreurIdentifiantServiceManquant extends ErreurJournal {}
class ErreurIdentifiantUtilisateurManquant extends ErreurJournal {}
class ErreurNombreMesuresCompletesManquant extends ErreurJournal {}
class ErreurNombreTotalMesuresManquant extends ErreurJournal {}

module.exports = {
  ErreurDetailMesuresManquant,
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
  ErreurNombreMesuresCompletesManquant,
  ErreurNombreTotalMesuresManquant,
};

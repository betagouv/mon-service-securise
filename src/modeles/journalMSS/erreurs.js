class ErreurJournal extends Error {}
class ErreurDateHomologationManquante extends ErreurJournal {}
class ErreurDetailMesuresManquant extends ErreurJournal {}
class ErreurDureeHomologationManquante extends ErreurJournal {}
class ErreurIdentifiantServiceManquant extends ErreurJournal {}
class ErreurIdentifiantUtilisateurManquant extends ErreurJournal {}
class ErreurIndiceCyberManquant extends ErreurJournal {}
class ErreurNombreMesuresCompletesManquant extends ErreurJournal {}
class ErreurNombreTotalMesuresManquant extends ErreurJournal {}

module.exports = {
  ErreurDateHomologationManquante,
  ErreurDetailMesuresManquant,
  ErreurDureeHomologationManquante,
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
  ErreurIndiceCyberManquant,
  ErreurNombreMesuresCompletesManquant,
  ErreurNombreTotalMesuresManquant,
};

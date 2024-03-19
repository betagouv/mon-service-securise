class ErreurJournal extends Error {}
class ErreurAutorisationsServiceManquantes extends ErreurJournal {}
class ErreurDateHomologationManquante extends ErreurJournal {}
class ErreurDureeHomologationManquante extends ErreurJournal {}
class ErreurIdentifiantServiceManquant extends ErreurJournal {}
class ErreurIdentifiantUtilisateurManquant extends ErreurJournal {}
class ErreurIdentifiantMesureManquant extends ErreurJournal {}
class ErreurIdentifiantRetourUtilisateurManquant extends ErreurJournal {}
class ErreurServiceManquant extends ErreurJournal {}
class ErreurUtilisateurManquant extends ErreurJournal {}

module.exports = {
  ErreurAutorisationsServiceManquantes,
  ErreurDateHomologationManquante,
  ErreurDureeHomologationManquante,
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
  ErreurIdentifiantMesureManquant,
  ErreurIdentifiantRetourUtilisateurManquant,
  ErreurServiceManquant,
  ErreurUtilisateurManquant,
};

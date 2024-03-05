class ErreurJournal extends Error {}
class ErreurAutorisationsServiceManquantes extends ErreurJournal {}
class ErreurDateHomologationManquante extends ErreurJournal {}
class ErreurDetailMesuresManquant extends ErreurJournal {}
class ErreurDureeHomologationManquante extends ErreurJournal {}
class ErreurIdentifiantServiceManquant extends ErreurJournal {}
class ErreurIdentifiantUtilisateurManquant extends ErreurJournal {}
class ErreurIdentifiantMesureManquant extends ErreurJournal {}
class ErreurIdentifiantRetourUtilisateurManquant extends ErreurJournal {}
class ErreurIndiceCyberManquant extends ErreurJournal {}
class ErreurNombreOrganisationsUtilisatricesManquant extends ErreurJournal {}
class ErreurNombreMesuresCompletesManquant extends ErreurJournal {}
class ErreurNombreTotalMesuresManquant extends ErreurJournal {}
class ErreurServiceManquant extends ErreurJournal {}

module.exports = {
  ErreurAutorisationsServiceManquantes,
  ErreurDateHomologationManquante,
  ErreurDetailMesuresManquant,
  ErreurDureeHomologationManquante,
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
  ErreurIdentifiantMesureManquant,
  ErreurIdentifiantRetourUtilisateurManquant,
  ErreurIndiceCyberManquant,
  ErreurNombreOrganisationsUtilisatricesManquant,
  ErreurNombreMesuresCompletesManquant,
  ErreurNombreTotalMesuresManquant,
  ErreurServiceManquant,
};

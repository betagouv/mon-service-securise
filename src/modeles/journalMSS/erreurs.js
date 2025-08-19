class ErreurJournal extends Error {}
class ErreurAutorisationsServiceManquantes extends ErreurJournal {}
class ErreurDateDerniereConnexionManquante extends ErreurJournal {}
class ErreurDateDerniereConnexionInvalide extends ErreurJournal {}
class ErreurDateHomologationManquante extends ErreurJournal {}
class ErreurDureeHomologationManquante extends ErreurJournal {}
class ErreurIdentifiantServiceManquant extends ErreurJournal {}
class ErreurIdentifiantUtilisateurManquant extends ErreurJournal {}
class ErreurIdentifiantMesureManquant extends ErreurJournal {}
class ErreurIdentifiantRetourUtilisateurManquant extends ErreurJournal {}
class ErreurNombreServicesImportes extends ErreurJournal {}
class ErreurServiceManquant extends ErreurJournal {}
class ErreurUtilisateurManquant extends ErreurJournal {}
class ErreurDonneeManquante extends ErreurJournal {
  constructor(nomDonneeManquante) {
    super(
      `Il manque la donnée ${nomDonneeManquante} pour instancier l'évènement`
    );
  }
}

module.exports = {
  ErreurAutorisationsServiceManquantes,
  ErreurDateDerniereConnexionManquante,
  ErreurDateDerniereConnexionInvalide,
  ErreurDateHomologationManquante,
  ErreurDonneeManquante,
  ErreurDureeHomologationManquante,
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
  ErreurIdentifiantMesureManquant,
  ErreurIdentifiantRetourUtilisateurManquant,
  ErreurNombreServicesImportes,
  ErreurServiceManquant,
  ErreurUtilisateurManquant,
};

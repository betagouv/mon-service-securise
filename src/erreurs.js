class EchecAutorisation extends Error {}
class EchecEnvoiMessage extends Error {}
class ErreurModele extends Error {}
class ErreurAutorisationExisteDeja extends ErreurModele {}
class ErreurAvisInvalide extends ErreurModele {}
class ErreurCategorieInconnue extends ErreurModele {}
class ErreurDateRenouvellementInvalide extends ErreurModele {}
class ErreurDonneesStatistiques extends ErreurModele {}
class ErreurEmailManquant extends ErreurModele {}
class ErreurHomologationInexistante extends ErreurModele {}
class ErreurIdentifiantActionSaisieInvalide extends ErreurModele {}
class ErreurIdentifiantActionSaisieManquant extends ErreurModele {}
class ErreurLocalisationDonneesInvalide extends ErreurModele {}
class ErreurMesureInconnue extends ErreurModele {}
class ErreurNiveauGraviteInconnu extends ErreurModele {}
class ErreurNomServiceDejaExistant extends ErreurModele {}
class ErreurNomServiceManquant extends ErreurModele {}
class ErreurRisqueInconnu extends ErreurModele {}
class ErreurStatutDeploiementInvalide extends ErreurModele {}
class ErreurStatutMesureInvalide extends ErreurModele {}
class ErreurUtilisateurExistant extends ErreurModele {}
class ErreurUtilisateurInexistant extends ErreurModele {}
class ErreurTypeInconnu extends ErreurModele {}

module.exports = {
  EchecAutorisation,
  EchecEnvoiMessage,
  ErreurAutorisationExisteDeja,
  ErreurAvisInvalide,
  ErreurCategorieInconnue,
  ErreurDateRenouvellementInvalide,
  ErreurDonneesStatistiques,
  ErreurEmailManquant,
  ErreurHomologationInexistante,
  ErreurIdentifiantActionSaisieInvalide,
  ErreurIdentifiantActionSaisieManquant,
  ErreurLocalisationDonneesInvalide,
  ErreurMesureInconnue,
  ErreurModele,
  ErreurNiveauGraviteInconnu,
  ErreurNomServiceDejaExistant,
  ErreurNomServiceManquant,
  ErreurRisqueInconnu,
  ErreurStatutDeploiementInvalide,
  ErreurStatutMesureInvalide,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
  ErreurTypeInconnu,
};

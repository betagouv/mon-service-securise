class EchecAutorisation extends Error {}
class EchecEnvoiMessage extends Error {}
class ErreurModele extends Error {}
class ErreurAutorisationExisteDeja extends ErreurModele {}
class ErreurAutorisationInexistante extends ErreurModele {}
class ErreurAvisInvalide extends ErreurModele {}
class ErreurCategorieInconnue extends ErreurModele {}
class ErreurDateHomologationInvalide extends ErreurModele {}
class ErreurDateRenouvellementInvalide extends ErreurModele {}
class ErreurDepartementInconnu extends ErreurModele {}
class ErreurDonneesReferentielIncorrectes extends Error {}
class ErreurDonneesStatistiques extends ErreurModele {}
class ErreurDossiersInvalides extends ErreurModele {}
class ErreurDureeValiditeInvalide extends ErreurModele {}
class ErreurEmailManquant extends ErreurModele {}
class ErreurCGUNonAcceptees extends Error {}
class ErreurHomologationInexistante extends ErreurModele {}
class ErreurIdentifiantActionSaisieInvalide extends ErreurModele {}
class ErreurIdentifiantActionSaisieManquant extends ErreurModele {}
class ErreurLocalisationDonneesInvalide extends ErreurModele {}
class ErreurMesureInconnue extends ErreurModele {}
class ErreurNiveauGraviteInconnu extends ErreurModele {}
class ErreurNomServiceDejaExistant extends ErreurModele {}
class ErreurNomServiceManquant extends ErreurModele {}
class ErreurProprieteManquante extends ErreurModele {}
class ErreurRisqueInconnu extends ErreurModele {}
class ErreurStatutDeploiementInvalide extends ErreurModele {}
class ErreurStatutMesureInvalide extends ErreurModele {}
class ErreurTentativeSuppressionCreateur extends ErreurModele {}
class ErreurUtilisateurInexistant extends ErreurModele {}
class ErreurTypeInconnu extends ErreurModele {}

class ErreurUtilisateurExistant extends ErreurModele {
  constructor(message = '', idUtilisateur) {
    super(message);
    this.idUtilisateur = idUtilisateur;
  }
}

module.exports = {
  EchecAutorisation,
  EchecEnvoiMessage,
  ErreurAutorisationExisteDeja,
  ErreurAutorisationInexistante,
  ErreurAvisInvalide,
  ErreurCategorieInconnue,
  ErreurDateHomologationInvalide,
  ErreurDateRenouvellementInvalide,
  ErreurDepartementInconnu,
  ErreurDonneesReferentielIncorrectes,
  ErreurDonneesStatistiques,
  ErreurDossiersInvalides,
  ErreurDureeValiditeInvalide,
  ErreurEmailManquant,
  ErreurCGUNonAcceptees,
  ErreurHomologationInexistante,
  ErreurIdentifiantActionSaisieInvalide,
  ErreurIdentifiantActionSaisieManquant,
  ErreurLocalisationDonneesInvalide,
  ErreurMesureInconnue,
  ErreurModele,
  ErreurNiveauGraviteInconnu,
  ErreurNomServiceDejaExistant,
  ErreurNomServiceManquant,
  ErreurProprieteManquante,
  ErreurRisqueInconnu,
  ErreurStatutDeploiementInvalide,
  ErreurStatutMesureInvalide,
  ErreurTentativeSuppressionCreateur,
  ErreurTypeInconnu,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
};

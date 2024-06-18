class EchecAutorisation extends Error {}
class EchecEnvoiMessage extends Error {}
class ErreurApiBrevo extends Error {}
class ErreurDroitsIncoherents extends Error {}
class ErreurChainageMiddleware extends Error {}
class ErreurModele extends Error {}
class ErreurAutorisationExisteDeja extends ErreurModele {}
class ErreurAutorisationInexistante extends ErreurModele {}
class ErreurAvisInvalide extends ErreurModele {}
class ErreurCategorieInconnue extends ErreurModele {}
class ErreurDateHomologationInvalide extends ErreurModele {}
class ErreurDateRenouvellementInvalide extends ErreurModele {}
class ErreurDonneesObligatoiresManquantes extends ErreurModele {}
class ErreurDonneesNiveauSecuriteInsuffisant extends ErreurModele {}
class ErreurDonneesReferentielIncorrectes extends Error {}
class ErreurDonneesStatistiques extends ErreurModele {}
class ErreurDossierCourantInexistant extends ErreurModele {}
class ErreurDossierDejaFinalise extends ErreurModele {}
class ErreurDossierEtapeInconnue extends ErreurModele {
  constructor(etapeInconnue) {
    super(`L'étape ${etapeInconnue} n'est pas une propriété du dossier.`);
    this.etapeInconnue = etapeInconnue;
  }
}
class ErreurDossierNonFinalisable extends ErreurModele {
  constructor(message, etapesIncompletes) {
    super(message);
    this.etapesIncompletes = etapesIncompletes;
  }
}
class ErreurDossierNonFinalise extends ErreurModele {}
class ErreurDossiersInvalides extends ErreurModele {}
class ErreurDureeValiditeInvalide extends ErreurModele {}
class ErreurEmailManquant extends ErreurModele {}
class ErreurServiceInexistant extends ErreurModele {}
class ErreurLocalisationDonneesInvalide extends ErreurModele {}
class ErreurMesureInconnue extends ErreurModele {}
class ErreurMotDePasseIncorrect extends ErreurModele {}
class ErreurNiveauGraviteInconnu extends ErreurModele {}
class ErreurNomServiceDejaExistant extends ErreurModele {}
class ErreurRisqueInconnu extends ErreurModele {}
class ErreurStatutDeploiementInvalide extends ErreurModele {}
class ErreurStatutMesureInvalide extends ErreurModele {}
class ErreurSuppressionImpossible extends Error {}
class ErreurUtilisateurInexistant extends ErreurModele {}
class ErreurTypeInconnu extends ErreurModele {}
class ErreurIdentifiantNouveauteInconnu extends ErreurModele {}

class ErreurUtilisateurExistant extends ErreurModele {
  constructor(message, idUtilisateur) {
    super(message);
    this.idUtilisateur = idUtilisateur;
  }
}

module.exports = {
  EchecAutorisation,
  EchecEnvoiMessage,
  ErreurApiBrevo,
  ErreurAutorisationExisteDeja,
  ErreurAutorisationInexistante,
  ErreurAvisInvalide,
  ErreurCategorieInconnue,
  ErreurChainageMiddleware,
  ErreurDateHomologationInvalide,
  ErreurDateRenouvellementInvalide,
  ErreurDonneesObligatoiresManquantes,
  ErreurDonneesReferentielIncorrectes,
  ErreurDonneesStatistiques,
  ErreurDossierCourantInexistant,
  ErreurDossierDejaFinalise,
  ErreurDossierEtapeInconnue,
  ErreurDossierNonFinalisable,
  ErreurDossierNonFinalise,
  ErreurDossiersInvalides,
  ErreurDroitsIncoherents,
  ErreurDureeValiditeInvalide,
  ErreurEmailManquant,
  ErreurIdentifiantNouveauteInconnu,
  ErreurLocalisationDonneesInvalide,
  ErreurMesureInconnue,
  ErreurMotDePasseIncorrect,
  ErreurModele,
  ErreurNiveauGraviteInconnu,
  ErreurNomServiceDejaExistant,
  ErreurRisqueInconnu,
  ErreurServiceInexistant,
  ErreurStatutDeploiementInvalide,
  ErreurStatutMesureInvalide,
  ErreurSuppressionImpossible,
  ErreurTypeInconnu,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
  ErreurDonneesNiveauSecuriteInsuffisant,
};

class EchecAutorisation extends Error {}
class EchecEnvoiMessage extends Error {}
class ErreurApiBrevo extends Error {}
class ErreurDroitsIncoherents extends Error {}
class ErreurDroitsInsuffisants extends Error {
  constructor(idUtilisateur, idServices, droitsRequis) {
    const u = idUtilisateur;
    const s = idServices.join(',');
    const d = JSON.stringify(droitsRequis);
    super(
      `L'utilisateur ${u} n'a pas les droits suffisants sur ${s}. Droits requis pour associer un modèle : ${d}`
    );
  }
}
class ErreurChainageMiddleware extends Error {}
class ErreurBusEvenements extends Error {
  constructor(typeEvenement, erreurDeAbonne) {
    const details = { cause: erreurDeAbonne };
    super(`Erreur dans un abonné à [${typeEvenement}]`, details);
  }
}
class ErreurHashDeSelInvalide extends Error {}
class ErreurSelManquant extends Error {}
class ErreurValeurSelIncoherente extends Error {}
class ErreurVersionSelInvalide extends Error {}

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
class ErreurModeleDeMesureSpecifiqueIntrouvable extends ErreurModele {
  constructor(identifiantInconnu) {
    super(
      `Le modèle de mesure spécifique '${identifiantInconnu}' est introuvable.`
    );
  }
}
class ErreurModeleDeMesureSpecifiqueDejaAssociee extends ErreurModele {
  constructor(idModele, idMesureDejaAssociee) {
    super(
      `Le modèle de mesure spécifique ${idModele} est déjà associé à la mesure ${idMesureDejaAssociee}`
    );
  }
}
class ErreurDetachementModeleMesureSpecifiqueImpossible extends ErreurModele {}
class ErreurMotDePasseIncorrect extends ErreurModele {}
class ErreurNiveauGraviteInconnu extends ErreurModele {}
class ErreurNiveauVraisemblanceInconnu extends ErreurModele {}
class ErreurNomServiceDejaExistant extends ErreurModele {}
class ErreurRisqueInconnu extends ErreurModele {}
class ErreurStatutDeploiementInvalide extends ErreurModele {}
class ErreurPrioriteMesureInvalide extends ErreurModele {}
class ErreurEcheanceMesureInvalide extends ErreurModele {}
class ErreurStatutMesureInvalide extends ErreurModele {}
class ErreurStatutMesureManquant extends ErreurModele {}
class ErreurSuppressionImpossible extends Error {}
class ErreurUtilisateurInexistant extends ErreurModele {}
class ErreurTypeInconnu extends ErreurModele {}
class ErreurIdentifiantNouveauteInconnu extends ErreurModele {}
class ErreurIdentifiantTacheInconnu extends ErreurModele {}
class ErreurIntituleRisqueManquant extends ErreurModele {}
class ErreurCategoriesRisqueManquantes extends ErreurModele {}
class ErreurCategorieRisqueInconnue extends ErreurModele {}
class ErreurFichierXlsInvalide extends ErreurModele {}

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
  ErreurBusEvenements,
  ErreurCategoriesRisqueManquantes,
  ErreurCategorieRisqueInconnue,
  ErreurCategorieInconnue,
  ErreurChainageMiddleware,
  ErreurDateHomologationInvalide,
  ErreurDateRenouvellementInvalide,
  ErreurDetachementModeleMesureSpecifiqueImpossible,
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
  ErreurDroitsInsuffisants,
  ErreurDureeValiditeInvalide,
  ErreurEcheanceMesureInvalide,
  ErreurEmailManquant,
  ErreurHashDeSelInvalide,
  ErreurIdentifiantNouveauteInconnu,
  ErreurIntituleRisqueManquant,
  ErreurLocalisationDonneesInvalide,
  ErreurMesureInconnue,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurMotDePasseIncorrect,
  ErreurModele,
  ErreurNiveauGraviteInconnu,
  ErreurNiveauVraisemblanceInconnu,
  ErreurNomServiceDejaExistant,
  ErreurRisqueInconnu,
  ErreurSelManquant,
  ErreurServiceInexistant,
  ErreurStatutDeploiementInvalide,
  ErreurStatutMesureInvalide,
  ErreurStatutMesureManquant,
  ErreurPrioriteMesureInvalide,
  ErreurSuppressionImpossible,
  ErreurTypeInconnu,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
  ErreurValeurSelIncoherente,
  ErreurVersionSelInvalide,
  ErreurDonneesNiveauSecuriteInsuffisant,
  ErreurIdentifiantTacheInconnu,
  ErreurFichierXlsInvalide,
};

/* eslint-disable max-classes-per-file */
import { UUID } from './typesBasiques.js';
import { type Droits } from './modeles/autorisations/gestionDroits.js';

class EchecAutorisation extends Error {}
class EchecEnvoiMessage extends Error {}
class ErreurApiBrevo extends Error {}
class ErreurDroitsIncoherents extends Error {}
class ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique extends Error {
  constructor(idUtilisateur: UUID, idServices: UUID[], droitsRequis: Droits) {
    const u = idUtilisateur;
    const s = idServices?.join(',');
    const d = JSON.stringify(droitsRequis);
    super(
      `L'utilisateur ${u} n'a pas les droits suffisants sur ${s}. Droits requis pour modifier un modèle : ${d}`
    );
  }
}
class ErreurChainageMiddleware extends Error {}
class ErreurBusEvenements extends Error {
  constructor(typeEvenement: string, erreurDeAbonne: Error) {
    const details = { cause: erreurDeAbonne };
    super(`Erreur dans un abonné à [${typeEvenement}]`, details);
  }
}
class ErreurHashDeSelInvalide extends Error {}
class ErreurSelManquant extends Error {}
class ErreurJWTInvalide extends Error {}
class ErreurJWTManquant extends Error {}
class ErreurValeurSelIncoherente extends Error {}
class ErreurVersionSelInvalide extends Error {}

class ErreurModele extends Error {}
class ErreurAutorisationExisteDeja extends ErreurModele {}
class ErreurAutorisationInexistante extends ErreurModele {}
class ErreurAvisInvalide extends ErreurModele {}
class ErreurCategorieInconnue extends ErreurModele {}
class ErreurDateHomologationInvalide extends ErreurModele {}
class ErreurDonneesObligatoiresManquantes extends ErreurModele {}
class ErreurDonneesNiveauSecuriteInsuffisant extends ErreurModele {}
class ErreurDonneesReferentielIncorrectes extends Error {}
class ErreurDossierCourantInexistant extends ErreurModele {}
class ErreurDossierDejaFinalise extends ErreurModele {}
class ErreurDossierEtapeInconnue extends ErreurModele {
  constructor(readonly etapeInconnue: string) {
    super(`L'étape ${etapeInconnue} n'est pas une propriété du dossier.`);
  }
}
class ErreurDossierNonFinalisable extends ErreurModele {
  constructor(
    message: string,
    readonly etapesIncompletes: string | string[]
  ) {
    super(message);
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
  constructor(identifiantInconnu: string) {
    super(
      `Le modèle de mesure spécifique '${identifiantInconnu}' est introuvable.`
    );
  }
}
class ErreurModeleDeMesureSpecifiqueDejaAssociee extends ErreurModele {
  constructor(idModele: UUID, idMesureDejaAssociee: UUID) {
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
class ErreurNombreLimiteModelesMesureSpecifiqueAtteint extends ErreurModele {}

class ErreurUtilisateurExistant extends ErreurModele {
  constructor(
    message: string,
    readonly idUtilisateur: UUID
  ) {
    super(message);
  }
}

class ErreurTeleversementInexistant extends ErreurModele {}
class ErreurTeleversementInvalide extends ErreurModele {}

class ErreurBrouillonInexistant extends ErreurModele {}

class ErreurMoteurDeReglesV2 extends ErreurModele {}
class ErreurVersionServiceIncompatible extends ErreurModele {}
class ErreurSimulationInexistante extends ErreurModele {}
/* eslint-enable max-classes-per-file */

export {
  EchecAutorisation,
  EchecEnvoiMessage,
  ErreurApiBrevo,
  ErreurAutorisationExisteDeja,
  ErreurAutorisationInexistante,
  ErreurAvisInvalide,
  ErreurBrouillonInexistant,
  ErreurBusEvenements,
  ErreurCategoriesRisqueManquantes,
  ErreurCategorieRisqueInconnue,
  ErreurCategorieInconnue,
  ErreurChainageMiddleware,
  ErreurDateHomologationInvalide,
  ErreurDetachementModeleMesureSpecifiqueImpossible,
  ErreurDonneesObligatoiresManquantes,
  ErreurDonneesReferentielIncorrectes,
  ErreurDossierCourantInexistant,
  ErreurDossierDejaFinalise,
  ErreurDossierEtapeInconnue,
  ErreurDossierNonFinalisable,
  ErreurDossierNonFinalise,
  ErreurDossiersInvalides,
  ErreurDroitsIncoherents,
  ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique,
  ErreurDureeValiditeInvalide,
  ErreurEcheanceMesureInvalide,
  ErreurEmailManquant,
  ErreurHashDeSelInvalide,
  ErreurIdentifiantNouveauteInconnu,
  ErreurIntituleRisqueManquant,
  ErreurJWTInvalide,
  ErreurJWTManquant,
  ErreurLocalisationDonneesInvalide,
  ErreurMesureInconnue,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurMotDePasseIncorrect,
  ErreurModele,
  ErreurMoteurDeReglesV2,
  ErreurNiveauGraviteInconnu,
  ErreurNiveauVraisemblanceInconnu,
  ErreurNombreLimiteModelesMesureSpecifiqueAtteint,
  ErreurNomServiceDejaExistant,
  ErreurRisqueInconnu,
  ErreurSelManquant,
  ErreurServiceInexistant,
  ErreurSimulationInexistante,
  ErreurStatutDeploiementInvalide,
  ErreurStatutMesureInvalide,
  ErreurStatutMesureManquant,
  ErreurPrioriteMesureInvalide,
  ErreurSuppressionImpossible,
  ErreurTeleversementInexistant,
  ErreurTeleversementInvalide,
  ErreurTypeInconnu,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
  ErreurValeurSelIncoherente,
  ErreurVersionSelInvalide,
  ErreurVersionServiceIncompatible,
  ErreurDonneesNiveauSecuriteInsuffisant,
  ErreurIdentifiantTacheInconnu,
  ErreurFichierXlsInvalide,
};

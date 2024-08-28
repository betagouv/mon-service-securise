const ActiviteMesure = require('../../modeles/activiteMesure');
const {
  fabriqueAdaptateurGestionErreur,
} = require('../../adaptateurs/fabriqueAdaptateurGestionErreur');

class ComparateurMesures {
  constructor(ancienneMesure, nouvelleMesure) {
    this.ancienneMesure = ancienneMesure;
    this.nouvelleMesure = nouvelleMesure;
  }

  aMisAJour = (propriete) =>
    this.ancienneMesure?.[propriete] !== this.nouvelleMesure[propriete] &&
    this.ancienneMesure?.[propriete] &&
    this.nouvelleMesure[propriete];

  aAjoute = (propriete) =>
    this.ancienneMesure?.[propriete] !== this.nouvelleMesure[propriete] &&
    !this.ancienneMesure?.[propriete] &&
    this.nouvelleMesure[propriete];

  aSupprime = (propriete) =>
    this.ancienneMesure?.[propriete] && !this.nouvelleMesure[propriete];

  proprietesMisesAJour = () =>
    ['statut', 'priorite', 'echeance'].filter((p) => this.aMisAJour(p));

  proprietesAjoutees = () =>
    ['statut', 'priorite', 'echeance'].filter((p) => this.aAjoute(p));

  proprietesSupprimees = () => ['echeance'].filter((p) => this.aSupprime(p));
}

function majuscule(chaine) {
  return chaine.charAt(0).toUpperCase() + chaine.substring(1);
}

function consigneActiviteMesure({ depotDonnees }) {
  return async ({ service, utilisateur, ancienneMesure, nouvelleMesure }) => {
    async function ajouteActivite(type, details) {
      try {
        const activiteMesure = new ActiviteMesure({
          service,
          acteur: utilisateur,
          type,
          details,
          mesure: nouvelleMesure,
        });
        await depotDonnees.ajouteActiviteMesure(activiteMesure);
      } catch (e) {
        fabriqueAdaptateurGestionErreur().logueErreur(
          "Erreur d'ajout d'activité",
          e
        );
      }
    }

    const ajouteMiseAJour = async (propriete) =>
      ajouteActivite(`miseAJour${majuscule(propriete)}`, {
        ancienneValeur: ancienneMesure?.[propriete],
        nouvelleValeur: nouvelleMesure[propriete],
      });

    const ajouteAjout = async (propriete) =>
      ajouteActivite(`ajout${majuscule(propriete)}`, {
        nouvelleValeur: nouvelleMesure[propriete],
      });

    const ajouteSuppression = async (propriete) =>
      ajouteActivite(`suppression${majuscule(propriete)}`, {
        ancienneValeur: ancienneMesure[propriete],
      });

    const comparateur = new ComparateurMesures(ancienneMesure, nouvelleMesure);

    comparateur
      .proprietesMisesAJour()
      .forEach((propriete) => ajouteMiseAJour(propriete));

    comparateur
      .proprietesAjoutees()
      .forEach((propriete) => ajouteAjout(propriete));

    comparateur
      .proprietesSupprimees()
      .forEach((propriete) => ajouteSuppression(propriete));
  };
}

module.exports = { consigneActiviteMesure };

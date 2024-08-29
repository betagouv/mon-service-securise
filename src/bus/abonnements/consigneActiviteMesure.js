const ActiviteMesure = require('../../modeles/activiteMesure');
const {
  fabriqueAdaptateurGestionErreur,
} = require('../../adaptateurs/fabriqueAdaptateurGestionErreur');

class ComparateurMesures {
  constructor(ancienneMesure, nouvelleMesure) {
    this.ancienneMesure = ancienneMesure;
    this.nouvelleMesure = nouvelleMesure;
  }

  valeursEgales(propriete) {
    if (propriete === 'echeance') {
      return (
        new Date(this.ancienneMesure[propriete]).getTime() ===
        new Date(this.nouvelleMesure[propriete]).getTime()
      );
    }
    return this.ancienneMesure[propriete] === this.nouvelleMesure[propriete];
  }

  aMisAJour = (propriete) =>
    this.ancienneMesure?.[propriete] &&
    !this.valeursEgales(propriete) &&
    this.nouvelleMesure[propriete];

  aAjoute = (propriete) =>
    !this.ancienneMesure?.[propriete] && this.nouvelleMesure[propriete];

  aSupprime = (propriete) =>
    this.ancienneMesure?.[propriete] && !this.nouvelleMesure[propriete];

  proprietesMisesAJour = () =>
    ['statut', 'priorite', 'echeance'].filter((p) => this.aMisAJour(p));

  proprietesAjoutees = () =>
    ['statut', 'priorite', 'echeance'].filter((p) => this.aAjoute(p));

  proprietesSupprimees = () => ['echeance'].filter((p) => this.aSupprime(p));
}

const majuscule = (chaine) =>
  `${chaine.charAt(0).toUpperCase()}${chaine.substring(1)}`;

const consigneActiviteMesure =
  ({ depotDonnees }) =>
  async ({ service, utilisateur, ancienneMesure, nouvelleMesure }) => {
    const consigneActivite = async (type, details) => {
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
    };

    const consigneMiseAJour = async (propriete) =>
      consigneActivite(`miseAJour${majuscule(propriete)}`, {
        ancienneValeur: ancienneMesure?.[propriete],
        nouvelleValeur: nouvelleMesure[propriete],
      });

    const consigneAjout = async (propriete) =>
      consigneActivite(`ajout${majuscule(propriete)}`, {
        nouvelleValeur: nouvelleMesure[propriete],
      });

    const consigneSuppression = async (propriete) =>
      consigneActivite(`suppression${majuscule(propriete)}`, {
        ancienneValeur: ancienneMesure[propriete],
      });

    const comparateur = new ComparateurMesures(ancienneMesure, nouvelleMesure);

    comparateur.proprietesMisesAJour().forEach(consigneMiseAJour);
    comparateur.proprietesAjoutees().forEach(consigneAjout);
    comparateur.proprietesSupprimees().forEach(consigneSuppression);

    const responsablesDeLancienneMesure = ancienneMesure?.responsables || [];

    const responsablesAjoutes = nouvelleMesure.responsables.filter(
      (r) => !responsablesDeLancienneMesure.includes(r)
    );
    responsablesAjoutes.forEach((r) =>
      consigneActivite('ajoutResponsable', {
        valeur: r,
      })
    );
  };

module.exports = { consigneActiviteMesure };

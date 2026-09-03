import ActiviteMesure from '../../modeles/activiteMesure.js';
import { fabriqueAdaptateurGestionErreur } from '../../adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { ComparateurMesures } from './comparateurMesures.js';

const majuscule = (chaine) =>
  `${chaine.charAt(0).toUpperCase()}${chaine.substring(1)}`;

const consigneActiviteMesure =
  ({ depotDonnees }) =>
  async ({
    service,
    utilisateur,
    ancienneMesure,
    nouvelleMesure,
    typeMesure,
  }) => {
    const consigneActivite = async (type, details) => {
      try {
        const activiteMesure = new ActiviteMesure({
          idService: service.id,
          idActeur: utilisateur.id,
          type,
          details,
          idMesure: nouvelleMesure.id,
          typeMesure,
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
    comparateur
      .responsablesAjoutes()
      .forEach((valeur) => consigneActivite('ajoutResponsable', { valeur }));
    comparateur
      .responsablesRetires()
      .forEach((valeur) =>
        consigneActivite('suppressionResponsable', { valeur })
      );
  };

export { consigneActiviteMesure };

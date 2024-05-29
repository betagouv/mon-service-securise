const axios = require('axios');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const rechercheOrganisations = async (terme, departement) => {
  try {
    const reponse = await axios.get(
      'https://recherche-entreprises.api.gouv.fr/search',
      {
        params: {
          q: terme,
          ...(departement && { departement }),
          per_page: 25,
          page: 1,
          limite_matching_etablissements: 1,
          est_entrepreneur_individuel: false,
          mtm_campaign: 'mon-service-securise',
        },
      }
    );

    return reponse.data.results
      .filter((r) => r.siege.departement !== null)
      .map((r) => ({
        nom: r.nom_complet,
        departement: r.siege.departement,
        siret: r.siege.siret,
      }));
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e, {
      'Erreur renvoyée par API recherche-entreprise': e.response?.data,
      'Statut HTTP': e.response?.status,
    });

    return [];
  }
};

const recupereDetailsOrganisation = async (siret) => {
  try {
    const reponse = await axios.get(
      'https://recherche-entreprises.api.gouv.fr/search',
      {
        params: {
          q: siret,
          per_page: 1,
          page: 1,
          limite_matching_etablissements: 1,
          mtm_campaign: 'mon-service-securise',
        },
      }
    );

    if (reponse.data.results.length !== 1) {
      fabriqueAdaptateurGestionErreur().logueErreur(
        new Error(
          `Recherche entreprise: résultat inattendu pour le SIRET ${siret}`
        ),
        { "Reponse de l'API recherche-entreprises": reponse.data }
      );
      return undefined;
    }

    const [entiteApi] = reponse.data.results;

    return {
      estServicePublic: entiteApi.complements.est_service_public,
      estFiness: entiteApi.complements.est_finess,
      estEss: entiteApi.complements.est_ess,
      estEntrepreneurIndividuel:
        entiteApi.complements.est_entrepreneur_individuel,
      estAssociation: entiteApi.complements.est_association,
      categorieEntreprise: entiteApi.categorie_entreprise,
      activitePrincipale: entiteApi.activite_principale,
      trancheEffectifSalarie: entiteApi.tranche_effectif_salarie,
      natureJuridique: entiteApi.nature_juridique,
      sectionActivitePrincipale: entiteApi.section_activite_principale,
      anneeTrancheEffectifSalarie: entiteApi.annee_tranche_effectif_salarie,
      commune: entiteApi.siege.commune,
      departement: entiteApi.siege.departement,
    };
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e, {
      'Erreur renvoyée par API recherche-entreprise': e.response?.data,
      'Statut HTTP': e.response?.status,
    });
    return undefined;
  }
};

module.exports = {
  rechercheOrganisations,
  recupereDetailsOrganisation,
};

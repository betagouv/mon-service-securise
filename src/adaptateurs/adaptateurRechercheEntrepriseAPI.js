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
      'Erreur renvoyée par API recherche-entreprise': e.response.data,
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
        },
      }
    );

    if (reponse.data.results.length !== 1) {
      fabriqueAdaptateurGestionErreur().logueErreur(
        new Error(
          `Recherche entreprise: pas de résultat pour le siret ${siret}`
        )
      );
      return undefined;
    }

    return reponse.data.results.map((r) => ({
      estServicePublic: r.complements.est_service_public,
      estFiness: r.complements.est_finess,
      estEss: r.complements.est_ess,
      estEntrepreneurIndividuel: r.complements.est_entrepreneur_individuel,
      collectiviteTerritoriale: r.complements.collectivite_territoriale,
      estAssociation: r.complements.est_association,
      categorieEntreprise: r.categorie_entreprise,
      activitePrincipale: r.activite_principale,
      trancheEffectifSalarie: r.tranche_effectif_salarie,
      natureJuridique: r.nature_juridique,
      sectionActivitePrincipale: r.section_activite_principale,
      anneeTrancheEffectifSalarie: r.annee_tranche_effectif_salarie,
      commune: r.siege.commune,
      departement: r.siege.departement,
    }))[0];
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e, {
      'Erreur renvoyée par API recherche-entreprise': e.response.data,
    });
    return undefined;
  }
};

module.exports = {
  rechercheOrganisations,
  recupereDetailsOrganisation,
};

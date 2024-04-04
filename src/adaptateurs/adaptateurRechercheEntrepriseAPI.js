const axios = require('axios');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const rechercheOrganisations = (terme, departement) =>
  axios
    .get('https://recherche-entreprises.api.gouv.fr/search', {
      params: {
        q: terme,
        ...(departement && { departement }),
        per_page: 25,
        page: 1,
        limite_matching_etablissements: 1,
        est_entrepreneur_individuel: false,
      },
    })
    .then((reponse) =>
      reponse.data.results
        .filter((r) => r.siege.departement !== null)
        .map((r) => ({
          nom: r.nom_complet,
          departement: r.siege.departement,
          siret: r.siege.siret,
        }))
    )
    .catch((e) => {
      fabriqueAdaptateurGestionErreur().logueErreur(e, {
        'Erreur renvoyée par API recherche-entreprise': e.response.data,
      });
      return Promise.resolve([]);
    });

const recupereDetailsOrganisation = (siret) =>
  axios
    .get('https://recherche-entreprises.api.gouv.fr/search', {
      params: {
        q: siret,
        per_page: 1,
        page: 1,
        limite_matching_etablissements: 1,
      },
    })
    .then((reponse) => {
      if (reponse.data.results.length !== 1) {
        fabriqueAdaptateurGestionErreur().logueErreur(
          new Error(
            `Recherche entreprise: pas de résultat pour le siret ${siret}`
          )
        );
        return Promise.resolve(undefined);
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
    })
    .catch((e) => {
      fabriqueAdaptateurGestionErreur().logueErreur(e, {
        'Erreur renvoyée par API recherche-entreprise': e.response.data,
      });
      return Promise.resolve(undefined);
    });

module.exports = {
  rechercheOrganisations,
  recupereDetailsOrganisation,
};

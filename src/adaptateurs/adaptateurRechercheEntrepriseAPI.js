const axios = require('axios');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const extraisDepartement = (commune) => {
  if (!commune) {
    return null;
  }

  return commune.startsWith('97') || commune.startsWith('98')
    ? commune.slice(0, 3)
    : commune.slice(0, 2);
};

const extraisInfosEtablissement = (terme, resultat) => {
  let nom = resultat.nom_complet;
  let { departement, siret } = resultat.siege;

  const estUneRechercheParSiret = terme.match('^[0-9 ]+$');

  const aUnEtablissement =
    resultat.matching_etablissements &&
    resultat.matching_etablissements.length > 0;

  if (estUneRechercheParSiret && aUnEtablissement) {
    const aUneListeEnseigne =
      resultat.matching_etablissements[0].liste_enseignes &&
      resultat.matching_etablissements[0].liste_enseignes.length > 0;
    if (aUneListeEnseigne) {
      // eslint-disable-next-line prefer-destructuring
      nom = resultat.matching_etablissements[0].liste_enseignes[0];
    }
    departement = extraisDepartement(
      resultat.matching_etablissements[0].commune
    );
    siret = resultat.matching_etablissements[0].siret;
  }

  return {
    nom,
    departement,
    siret,
  };
};

const rechercheOrganisations = async (
  terme,
  departement,
  instanceAxios = axios
) => {
  try {
    const reponse = await instanceAxios.get(
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
      .map((r) => extraisInfosEtablissement(terme, r));
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e, {
      'Erreur renvoyée par API recherche-entreprise': e.response?.data,
      'Statut HTTP': e.response?.status,
    });

    return [];
  }
};

const recupereDetailsOrganisation = async (siret, instanceAxios = axios) => {
  try {
    const reponse = await instanceAxios.get(
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
    const etablissement = entiteApi.matching_etablissements[0];

    return {
      estServicePublic: entiteApi.complements.est_service_public,
      estFiness: entiteApi.complements.est_finess,
      estEss: entiteApi.complements.est_ess,
      estEntrepreneurIndividuel:
        entiteApi.complements.est_entrepreneur_individuel,
      estAssociation: entiteApi.complements.est_association,
      categorieEntreprise: entiteApi.categorie_entreprise,
      activitePrincipale: etablissement.activite_principale,
      trancheEffectifSalarie: etablissement.tranche_effectif_salarie,
      natureJuridique: entiteApi.nature_juridique,
      sectionActivitePrincipale: entiteApi.section_activite_principale,
      anneeTrancheEffectifSalarie: etablissement.annee_tranche_effectif_salarie,
      commune: etablissement.commune,
      departement: extraisDepartement(etablissement.commune),
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

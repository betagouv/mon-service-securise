const Parrainage = require('../../modeles/parrainage');

function consigneNouveauParrainage({ depotDonnees }) {
  return async ({ idUtilisateurDestinataire, idUtilisateurEmetteur }) => {
    depotDonnees.ajouteParrainage(
      Parrainage.nouveauParrainage(
        idUtilisateurDestinataire,
        idUtilisateurEmetteur
      )
    );
  };
}

module.exports = { consigneNouveauParrainage };

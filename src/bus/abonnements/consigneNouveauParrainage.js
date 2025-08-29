import Parrainage from '../../modeles/parrainage.js';

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

export { consigneNouveauParrainage };

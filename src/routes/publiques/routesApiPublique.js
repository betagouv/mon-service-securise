const express = require('express');

const routesApiPublique = ({ middleware, referentiel, depotDonnees }) => {
  const routes = express.Router();

  routes.post(
    '/desinscriptionInfolettre',
    middleware.verificationAddresseIP(['185.107.232.1/24', '1.179.112.1/20']),
    (requete, reponse, suite) => {
      const { event: typeEvenement, email } = requete.body;

      if (typeEvenement !== 'unsubscribe') {
        reponse
          .status(400)
          .json({ erreur: "L'événement doit être de type 'unsubscribe'" });
        return;
      }

      if (!email) {
        reponse
          .status(400)
          .json({ erreur: "Le champ 'email' doit être présent" });
        return;
      }

      depotDonnees.utilisateurAvecEmail(email).then((utilisateur) => {
        if (!utilisateur) {
          reponse
            .status(424)
            .json({ erreur: `L'email '${email}' est introuvable` });
          return;
        }
        depotDonnees
          .metsAJourUtilisateur(utilisateur.id, {
            ...utilisateur,
            infolettreAcceptee: false,
          })
          .then(() => reponse.sendStatus(200))
          .catch(suite);
      });
    }
  );

  routes.get(
    '/nouvelleFonctionnalite/:id',
    middleware.aseptise('id'),
    (requete, reponse) => {
      const idNouvelleFonctionnalite = requete.params.id;
      const nouvelleFonctionnalite = referentiel.nouvelleFonctionnalite(
        idNouvelleFonctionnalite
      );

      if (!nouvelleFonctionnalite) {
        reponse.status(404).send('Nouvelle fonctionnalité inconnue');
        return;
      }

      reponse.render(
        `nouvellesFonctionnalites/${nouvelleFonctionnalite.fichierPug}`
      );
    }
  );

  return routes;
};

module.exports = routesApiPublique;

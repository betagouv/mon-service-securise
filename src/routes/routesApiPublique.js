const express = require('express');

const routesApiPublique = ({
  adaptateurAnnuaire,
  middleware,
  depotDonnees,
  referentiel,
}) => {
  const routes = express.Router();

  routes.get('/annuaire/suggestions', (requete, reponse) => {
    const { recherche = '', departement = null } = requete.query;

    if (recherche === '') {
      reponse.status(400).send('Le terme de recherche ne peut pas être vide');
      return;
    }
    if (departement !== null && !referentiel.estCodeDepartement(departement)) {
      reponse.status(400).send('Le département doit être valide (01 à 989)');
      return;
    }

    adaptateurAnnuaire
      .rechercheOrganisation(recherche, departement)
      .then((suggestions) => reponse.status(200).json({ suggestions }));
  });

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

  return routes;
};

module.exports = { routesApiPublique };

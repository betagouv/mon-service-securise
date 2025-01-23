const express = require('express');
const { valeurBooleenne } = require('../../utilitaires/aseptisation');
const {
  valideMotDePasse,
  resultatValidation,
} = require('../../http/validationMotDePasse');
const SourceAuthentification = require('../../modeles/sourceAuthentification');
const Utilisateur = require('../../modeles/utilisateur');
const {
  obtentionDonneesDeBaseUtilisateur,
  messageErreurDonneesUtilisateur,
} = require('../mappeur/utilisateur');
const { DUREE_SESSION } = require('../../http/configurationServeur');

const routesConnecteApiSansVerifCGU = ({
  middleware,
  adaptateurMail,
  depotDonnees,
  serviceGestionnaireSession,
  serviceCgu,
}) => {
  const routes = express.Router();
  routes.put(
    '/motDePasse',
    middleware.aseptise('cguAcceptees', 'infolettreAcceptee'),
    async (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const cguDejaAcceptees = requete.cguAcceptees;
      const cguEnCoursDAcceptation = valeurBooleenne(requete.body.cguAcceptees);
      const infolettreAcceptee = valeurBooleenne(
        requete.body.infolettreAcceptee
      );
      const { motDePasse } = requete.body;

      if (!cguDejaAcceptees && !cguEnCoursDAcceptation) {
        reponse.status(422).send('CGU non acceptées');
        return;
      }

      if (
        valideMotDePasse(motDePasse) !== resultatValidation.MOT_DE_PASSE_VALIDE
      ) {
        reponse.status(422).send('Mot de passe trop simple');
        return;
      }

      try {
        let u = await depotDonnees.utilisateur(idUtilisateur);
        await depotDonnees.metsAJourMotDePasse(idUtilisateur, motDePasse);
        u = await depotDonnees.valideAcceptationCGUPourUtilisateur(u);
        await depotDonnees.supprimeIdResetMotDePassePourUtilisateur(u);
        await adaptateurMail.inscrisEmailsTransactionnels(u.email);
        if (infolettreAcceptee) {
          await adaptateurMail.inscrisInfolettre(u.email);
          await depotDonnees.metsAJourUtilisateur(u.id, {
            infolettreAcceptee: true,
          });
        }

        serviceGestionnaireSession.enregistreSession(
          requete,
          u,
          SourceAuthentification.MSS
        );

        reponse.json({ idUtilisateur });
      } catch (e) {
        suite(e);
      }
    }
  );

  routes.put('/utilisateur/acceptationCGU', async (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    let u = await depotDonnees.utilisateur(idUtilisateur);
    u = await depotDonnees.valideAcceptationCGUPourUtilisateur(u);

    serviceGestionnaireSession.enregistreSession(
      requete,
      u,
      requete.sourceAuthentification
    );

    reponse.sendStatus(200);
  });

  routes.patch(
    '/motDePasse',
    middleware.challengeMotDePasse,
    async (requete, reponse) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const { motDePasse } = requete.body;

      const mdpInvalide =
        valideMotDePasse(motDePasse) !== resultatValidation.MOT_DE_PASSE_VALIDE;
      if (mdpInvalide) {
        reponse.status(422).send('Mot de passe trop simple');
        return;
      }

      await depotDonnees.metsAJourMotDePasse(idUtilisateur, motDePasse);
      reponse.json({ idUtilisateur });
    }
  );

  routes.put(
    '/utilisateur',
    middleware.aseptise(
      ...Utilisateur.nomsProprietesBase().filter((nom) => nom !== 'email'),
      'siretEntite'
    ),
    (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const donnees = obtentionDonneesDeBaseUtilisateur(
        requete.body,
        serviceCgu
      );
      const { donneesInvalides, messageErreur } =
        messageErreurDonneesUtilisateur(donnees, true);

      if (donneesInvalides) {
        reponse
          .status(422)
          .send(
            `La mise à jour de l'utilisateur a échoué car les paramètres sont invalides. ${messageErreur}`
          );
        return;
      }

      depotDonnees
        .utilisateur(idUtilisateur)
        .then((utilisateur) =>
          utilisateur.changePreferencesCommunication(
            {
              infolettreAcceptee: donnees.infolettreAcceptee,
              transactionnelAccepte: donnees.transactionnelAccepte,
            },
            adaptateurMail
          )
        )
        .then(() => depotDonnees.metsAJourUtilisateur(idUtilisateur, donnees))
        .then(() => reponse.json({ idUtilisateur }))
        .catch(suite);
    }
  );

  routes.get('/utilisateurCourant', (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    if (idUtilisateur) {
      depotDonnees.utilisateur(idUtilisateur).then((utilisateur) => {
        reponse.json({
          sourceAuthentification: requete.sourceAuthentification,
          utilisateur: {
            prenomNom: utilisateur.prenomNom(),
          },
        });
      });
    } else reponse.status(401).send("Pas d'utilisateur courant");
  });

  routes.get('/dureeSession', (_requete, reponse) => {
    const MARGE_DE_SECURITE_CSRF_MISMATCH = 2 * 60_000;
    reponse.send({
      dureeSession: DUREE_SESSION - MARGE_DE_SECURITE_CSRF_MISMATCH,
    });
  });

  return routes;
};

module.exports = routesConnecteApiSansVerifCGU;

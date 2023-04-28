const controlAcces = require('express-ip-access-control');
const basicAuth = require('express-basic-auth');
const pug = require('pug');
const { check } = require('express-validator');
const adaptateurEnvironnementParDefaut = require('../adaptateurs/adaptateurEnvironnement');

const middleware = (configuration = {}) => {
  const
    {
      depotDonnees,
      adaptateurChiffrement,
      adaptateurEnvironnement = adaptateurEnvironnementParDefaut,
      adaptateurJWT,
      login,
      motDePasse,
    } = configuration;

  const authentificationBasique = basicAuth({
    challenge: true,
    realm: 'Administration MonServiceSécurisé',
    users: { [login]: motDePasse },
    unauthorizedResponse: () => pug.renderFile('src/vues/accesRefuse.pug'),
  });

  const positionneHeaders = (requete, reponse, suite) => {
    const { nonce } = requete;

    const defaultCsp = "default-src 'self'";
    const imgCsp = "img-src 'self' data:";
    const styleCsp = nonce ? `style-src 'self' 'nonce-${nonce}'` : '';
    const scriptCsp = "script-src 'self'";
    const frameCsp = adaptateurEnvironnement.statistiques().domaineMetabaseMSS()
      ? `frame-src ${adaptateurEnvironnement.statistiques().domaineMetabaseMSS()}` : '';

    const toutesCsp = [defaultCsp, imgCsp, styleCsp, scriptCsp, frameCsp].filter((csp) => csp !== '');

    reponse.set({
      'content-security-policy': `${toutesCsp.join('; ')}`,
      'x-frame-options': 'deny',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    });

    suite();
  };

  const positionneHeadersAvecNonce = (requete, reponse, suite) => adaptateurChiffrement.nonce()
    .then((n) => {
      requete.nonce = n;
      positionneHeaders(requete, reponse, suite);
    })
    .catch(suite);

  const repousseExpirationCookie = (requete, _reponse, suite) => {
    requete.session.maintenant = Math.floor(Date.now() / 60_000);
    suite();
  };

  const suppressionCookie = (requete, _reponse, suite) => {
    requete.session = null;
    suite();
  };

  const verificationJWT = (requete, reponse, suite) => {
    const token = adaptateurJWT.decode(requete.session.token);
    if (!token) reponse.redirect('/connexion');
    else {
      depotDonnees.utilisateurExiste(token.idUtilisateur)
        .then((utilisateurExiste) => {
          if (!utilisateurExiste) reponse.redirect('/connexion');
          else {
            requete.idUtilisateurCourant = token.idUtilisateur;
            requete.cguAcceptees = token.cguAcceptees;
            suite();
          }
        });
    }
  };

  const verificationAcceptationCGU = (requete, reponse, suite) => {
    verificationJWT(requete, reponse, () => {
      if (!requete.cguAcceptees) reponse.redirect('/motDePasse/edition');
      else suite();
    });
  };

  const trouveService = (requete, reponse, suite) => {
    const idService = requete.params.id;

    verificationAcceptationCGU(requete, reponse, () => depotDonnees.homologation(idService)
      .then((homologation) => {
        const idUtilisateur = requete.idUtilisateurCourant;

        if (!homologation) reponse.status(404).send('Service non trouvé');
        else {
          depotDonnees.accesAutorise(idUtilisateur, idService)
            .then((accesAutorise) => {
              if (!accesAutorise) reponse.status(403).send('Accès au service refusé');
              else {
                requete.homologation = homologation;
                suite();
              }
            });
        }
      })
      .catch(() => reponse.status(422).send("Le service n'a pas pu être récupéré")));
  };

  const trouveDossierCourant = (requete, reponse, suite) => {
    if (!requete.homologation) throw new Error('Une homologation doit être présente dans la requête. Manque-t-il un appel à `trouveService` ?');

    const dossierCourant = requete.homologation.dossierCourant();
    if (!dossierCourant) {
      reponse.status(404).send('Homologation sans dossier courant');
    } else {
      requete.dossierCourant = dossierCourant;
      suite();
    }
  };

  const aseptise = (...nomsParametres) => ((requete, _reponse, suite) => {
    const paramsTableauxVides = Object.keys(requete.body)
      .filter((p) => (Array.isArray(requete.body[p]) && requete.body[p].length === 0));

    const aseptisations = nomsParametres.map((p) => check(p).trim().escape().run(requete));

    return Promise.all(aseptisations)
      .then(() => paramsTableauxVides.forEach((p) => (requete.body[p] = [])))
      .then(() => suite())
      .catch(suite);
  });

  const aseptiseListes = (listes) => (
    (requete, reponse, suite) => {
      const nonTableau = listes
        .filter(({ nom }) => !Array.isArray(requete.body[nom]))
        .map((p) => p.nom);

      if (nonTableau.length > 0) {
        reponse.status(400).send(`[${nonTableau.join(', ')}] devrait être un tableau`);
        return () => {};
      }

      listes.forEach(({ nom, proprietes }) => {
        requete.body[nom] &&= requete.body[nom].filter(
          (element) => proprietes.some((propriete) => element && element[propriete])
        );
      });
      const proprietesAAseptiser = listes.flatMap(({ nom, proprietes }) => (
        proprietes.map((propriete) => `${nom}.*.${propriete}`)
      ));
      return aseptise(proprietesAAseptiser)(requete, reponse, suite);
    }
  );

  const aseptiseListe = (nomListe, proprietesParametre) => (
    aseptiseListes([{ nom: nomListe, proprietes: proprietesParametre }])
  );

  const verificationAddresseIP = (listeAddressesIPsAutorisee) => controlAcces({
    mode: 'allow',
    allows: listeAddressesIPsAutorisee,
    forceConnectionAddress: false,
    log: false,
    statusCode: 401,
    message: 'Non autorisé',
  });

  return {
    aseptise,
    aseptiseListe,
    aseptiseListes,
    authentificationBasique,
    positionneHeaders,
    positionneHeadersAvecNonce,
    repousseExpirationCookie,
    suppressionCookie,
    trouveService,
    trouveDossierCourant,
    verificationAcceptationCGU,
    verificationAddresseIP,
    verificationJWT,
  };
};

module.exports = middleware;

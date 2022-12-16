const basicAuth = require('express-basic-auth');
const pug = require('pug');
const { check } = require('express-validator');

const middleware = (configuration = {}) => {
  const { depotDonnees, adaptateurChiffrement, adaptateurJWT, login, motDePasse } = configuration;

  const authentificationBasique = basicAuth({
    challenge: true,
    realm: 'Administration MonServiceSécurisé',
    users: { [login]: motDePasse },
    unauthorizedResponse: () => pug.renderFile('src/vues/accesRefuse.pug'),
  });

  const positionneHeaders = (requete, reponse, suite) => {
    const { nonce } = requete;

    const csp = () => {
      const fournisseursContenu = {
        mss: {
          connectSrc: "'self'",
          defaultSrc: "'self'",
          fontSrc: "'self'",
          imgSrc: "'self' data:",
          styleSrc: `'self' ${nonce ? `'nonce-${nonce}'` : ''}`,
          scriptsSrc: "'self'",
        },
        crisp: {
          // Liste obtenue de https://docs.crisp.chat/guides/others/whitelisting-our-systems/crisp-domain-names/
          connectSrc: 'https://client.crisp.chat https://storage.crisp.chat wss://client.relay.crisp.chat wss://stream.relay.crisp.chat',
          imgSrc: 'https://client.crisp.chat https://image.crisp.chat https://storage.crisp.chat',
          fontSrc: 'https://client.crisp.chat',
          mediaSrc: 'https://client.crisp.chat',
          scriptSrc: 'https://client.crisp.chat https://settings.crisp.chat',
          styleSrc: "'unsafe-inline' https://client.crisp.chat",
        },
      };
      const { mss, crisp } = fournisseursContenu;
      const politiques = [
        ['connect-src', `${mss.connectSrc} ${crisp.connectSrc}`],
        ['default-src', `${mss.defaultSrc}`],
        ['font-src', `${mss.fontSrc} ${crisp.fontSrc}`],
        ['img-src', `${mss.imgSrc} ${crisp.imgSrc}`],
        ['media-src', `${crisp.mediaSrc}`],
        ['script-src', `${mss.scriptsSrc} ${crisp.scriptSrc}`],
        ['style-src', `${mss.styleSrc} ${crisp.styleSrc}`],
      ];
      return politiques.map(([nom, valeur]) => `${nom} ${valeur}`).join(';');
    };

    reponse.set({
      'content-security-policy': csp(),
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
      if (!requete.cguAcceptees) reponse.redirect('/utilisateur/edition');
      else suite();
    });
  };

  const trouveHomologation = (requete, reponse, suite) => {
    const idHomologation = requete.params.id;

    verificationAcceptationCGU(requete, reponse, () => depotDonnees.homologation(idHomologation)
      .then((homologation) => {
        const idUtilisateur = requete.idUtilisateurCourant;

        if (!homologation) reponse.status(404).send('Homologation non trouvée');
        else {
          depotDonnees.accesAutorise(idUtilisateur, idHomologation)
            .then((accesAutorise) => {
              if (!accesAutorise) reponse.status(403).send("Accès à l'homologation refusé");
              else {
                requete.homologation = homologation;
                suite();
              }
            });
        }
      })
      .catch(() => reponse.status(422).send("L'homologation n'a pas pu être récupérée")));
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

  return {
    aseptise,
    aseptiseListe,
    aseptiseListes,
    authentificationBasique,
    positionneHeaders,
    positionneHeadersAvecNonce,
    repousseExpirationCookie,
    suppressionCookie,
    trouveHomologation,
    verificationAcceptationCGU,
    verificationJWT,
  };
};

module.exports = middleware;

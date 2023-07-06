const { csrf } = require('lusca');
const rateLimit = require('express-rate-limit');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const adaptateurProtection = {
  protectionCsrf: (pointsEntreesSansProtection) =>
    csrf({ blocklist: pointsEntreesSansProtection }),

  protectionLimiteTrafic: () => {
    const uneMinute = 60 * 1000;
    const maxParFenetreParIp = 600;
    const routesNonLimitees = ['/statique/', '/bibliotheques/', '/favicon.ico'];

    return rateLimit({
      windowMs: uneMinute,
      max: maxParFenetreParIp,
      handler: (requete, reponse) => {
        const attaque = requete.headers['x-real-ip']?.replaceAll('.', '*');
        fabriqueAdaptateurGestionErreur().logueErreur(
          new Error('Limite de trafic atteinte par une IP.'),
          { 'IP de la requete': attaque }
        );
        reponse.render('erreurTropDeTrafic');
      },
      skip: (requete) =>
        routesNonLimitees.some((r) => requete.path.startsWith(r)),
      keyGenerator: (requete) =>
        // Utilise l'IP de l'utilisateur : https://doc.scalingo.com/platform/internals/routing
        requete.headers['x-real-ip'],
    });
  },
};

module.exports = { adaptateurProtection };

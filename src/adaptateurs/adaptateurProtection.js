const { csrf } = require('lusca');
const rateLimit = require('express-rate-limit');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const uneMinute = 60 * 1000;
const parametresCommuns = (typeRequete, doitFermerConnexion = false) => ({
  windowMs: uneMinute,
  handler: (requete, reponse) => {
    const attaque = requete.ip.replaceAll('.', '*');

    if (typeRequete === 'Navigation')
      // eslint-disable-next-line no-console
      console.warn(
        `[${typeRequete}] Limite de trafic atteinte par l'IP ${attaque}.`
      );
    else
      fabriqueAdaptateurGestionErreur().logueErreur(
        new Error(`[${typeRequete}] Limite de trafic atteinte par une IP.`),
        { typeRequete, 'IP de la requete': attaque }
      );

    if (doitFermerConnexion) reponse.end();
    else reponse.render('erreurTropDeTrafic');
  },
});

const adaptateurProtection = {
  protectionCsrf: (pointsEntreesSansProtection) =>
    csrf({ blocklist: pointsEntreesSansProtection }),

  protectionLimiteTrafic: () => {
    const maxParFenetreParIp = process.env.NB_REQUETES_MAX_PAR_MINUTE ?? 0;
    const routesNonLimitees = ['/statique/', '/bibliotheques/', '/favicon.ico'];

    return rateLimit({
      ...parametresCommuns('Navigation'),
      max: maxParFenetreParIp,
      skip: (requete) =>
        routesNonLimitees.some((r) => requete.path.startsWith(r)),
    });
  },

  protectionLimiteTraficEndpointSensible: () => {
    const maxParFenetreParIp =
      process.env.NB_REQUETES_MAX_PAR_MINUTE_ENDPOINT_SENSIBLE ?? 0;

    return rateLimit({
      ...parametresCommuns('API', true),
      max: maxParFenetreParIp,
    });
  },
};

module.exports = { adaptateurProtection };

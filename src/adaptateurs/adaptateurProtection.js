import lusca from 'lusca';
import rateLimit from 'express-rate-limit';
import { fabriqueAdaptateurGestionErreur } from './fabriqueAdaptateurGestionErreur.js';

const uneMinute = 60 * 1000;
const parametresCommuns = (typeRequete) => ({
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

    return reponse.status(429).end();
  },
});

const adaptateurProtection = {
  protectionCsrf: (pointsEntreesSansProtection) =>
    lusca.csrf({ blocklist: pointsEntreesSansProtection }),

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
      ...parametresCommuns('API'),
      max: maxParFenetreParIp,
    });
  },
};

export { adaptateurProtection };

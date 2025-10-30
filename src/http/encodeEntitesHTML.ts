import { Express } from 'express';
import { encode } from 'html-entities';

// On veut que le PUG puisse encoder les entités HTML pour passer des objets sérialisés au Svelte.
export function ajouteHtmlEntitiesEncode(app: Express) {
  // eslint-disable-next-line no-param-reassign
  app.locals.StringifyAvecHTMLEntitiesEncode = (objet: object) =>
    // Pour encoder récursivement, on s'appuie sur JSON.stringify()
    JSON.stringify(objet, (_cle, valeur) =>
      typeof valeur === 'string' ? encode(valeur) : valeur
    );
}

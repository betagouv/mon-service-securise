import { Express } from 'express';
import DOMPurify from 'isomorphic-dompurify';

// On veut que le PUG puisse utiliser DOMPurify pour passer des objets sérialisés au Svelte.
export function ajouteDOMPurify(app: Express) {
  // eslint-disable-next-line no-param-reassign
  app.locals.StringifyAvecDOMPurify = (objet: object) =>
    // Pour purifier récursivement, on s'appuie sur JSON.stringify()
    JSON.stringify(objet, (_cle, valeur) =>
      typeof valeur === 'string' ? DOMPurify.sanitize(valeur) : valeur
    );
}

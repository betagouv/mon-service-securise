const dot = require('dot');

/**
 * La configuration de dot.js est définie avec le caractère `_`
 * avec une utilisation comme suit
 * __ __ pour évaluer
 * __= __ pour interpoler
 * __! __ pour interpoler avec encodage
 * __# __ pour inclure partiellement du code et évaluer
 * __## #__ pour définir des blocs pouvant être appelés
 * __? __ pour les conditions
 * __~ __ pour itérer dans un tableau
 *
 * L'objet de données est `donnees`
 * et la suppression des espaces et des retours à la ligne est annulée.
 *
 */
/* eslint-disable no-useless-escape */
dot.templateSettings = {
  evaluate: /__([\s\S]+?)__/g,
  interpolate: /__=([\s\S]+?)__/g,
  encode: /__!([\s\S]+?)__/g,
  use: /__#([\s\S]+?)__/g,
  define: /__##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#__/g,
  conditional: /__\?(\?)?\s*([\s\S]*?)\s*__/g,
  iterate: /__~\s*(?:__|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*__)/g,
  varname: 'donnees',
  strip: false,
};
/* eslint-enable no-useless-escape */

const confectionne = (modele, donnees) => {
  const template = dot.template(modele);
  return template(donnees);
};

module.exports = { confectionne };

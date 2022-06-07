import { initialiseComportementModale } from './modules/interactions/modale.mjs';
import afficheModaleDeconnexion from './modules/interactions/afficheModaleDeconnexion.mjs';

const DELAI = 60 * 60 * 1000;

$(() => {
  initialiseComportementModale($('.rideau#deconnexion'));

  setTimeout(afficheModaleDeconnexion, DELAI, '.rideau#deconnexion', '.rideau');
});

import { initialiseComportementModale } from './modules/interactions/modale.mjs';
import afficheModaleDeconnexion from './modules/interactions/afficheModaleDeconnexion.mjs';

const dureeSessionLocal = () => {
  if (localStorage.dureeSession) {
    return Promise.resolve(localStorage.dureeSession);
  }
  return axios.get('/dureeSession').then((reponse) => {
    localStorage.dureeSession = reponse.data;
  });
};

$(() => {
  initialiseComportementModale($('.rideau#deconnexion'));

  dureeSessionLocal().then((dureeSession) => {
    const duree = parseInt(dureeSession, 10);
    if (duree) {
      setTimeout(afficheModaleDeconnexion, duree, '.rideau#deconnexion', '.rideau');
    }
  });
});

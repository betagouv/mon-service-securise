import afficheModaleDeconnexion from './interactions/afficheModaleDeconnexion.mjs';

const lanceDecompteDeconnexion = (dureeSession) => {
  setTimeout(afficheModaleDeconnexion, dureeSession, '.rideau#deconnexion', '.rideau');
};

export default lanceDecompteDeconnexion;

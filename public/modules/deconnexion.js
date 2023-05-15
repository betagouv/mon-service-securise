import afficheModaleDeconnexion from './interactions/afficheModaleDeconnexion.mjs';

const HEURE_DECONNEXION = 'heureDeconnexion';

const lanceDecompteAffichage = () => {
  if (Date.now() >= localStorage.getItem(HEURE_DECONNEXION)) {
    afficheModaleDeconnexion('.rideau#deconnexion', '.rideau');
  } else {
    setTimeout(
      lanceDecompteAffichage,
      localStorage.getItem(HEURE_DECONNEXION) - Date.now()
    );
  }
};

const lanceDecompteDeconnexion = (dureeSession) => {
  localStorage.setItem(
    HEURE_DECONNEXION,
    new Date(Date.now() + dureeSession).valueOf()
  );
  setTimeout(lanceDecompteAffichage, dureeSession);
};

export default lanceDecompteDeconnexion;

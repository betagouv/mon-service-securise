const afficheModaleDeconnexion = (selecteurModaleDeconnexion, selecteurModales) => {
  $(selecteurModales).trigger('fermeModale');
  $(selecteurModaleDeconnexion).trigger('afficheModale');
};

export default afficheModaleDeconnexion;

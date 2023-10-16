const basculeEnCoursChargement = ($bouton, etat) => {
  $bouton.toggleClass('en-cours-chargement', etat).prop('disabled', etat);
};

export default basculeEnCoursChargement;

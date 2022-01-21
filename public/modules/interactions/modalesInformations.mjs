import initialiseComportementModale from './modale.mjs';

const brancheModales = (selecteurAffichageModale) => {
  $(selecteurAffichageModale).each((_, afficheur) => {
    const $rideauModale = $('.rideau', $(afficheur));
    initialiseComportementModale($rideauModale);
  });

  $(selecteurAffichageModale).on('click', (eDemandeAffichage) => {
    eDemandeAffichage.preventDefault();
    const $rideauModale = $('.rideau', $(eDemandeAffichage.target));
    $rideauModale.trigger('afficheModale');
  });
};

const ajouteModalesInformations = () => brancheModales('.puce-information');

export default ajouteModalesInformations;

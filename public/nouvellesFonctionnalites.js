import brancheComportementModaleNouvelleFonctionnalite from './modules/modaleNouvellesFonctionnalites.mjs';

const brancheComportementAffichageCarrousel = () => {
  $('.bouton[data-id-nouvelle-fonctionnalite]', '.conteneur-action').on(
    'click',
    (evenement) => {
      const id = $(evenement.target).attr('data-id-nouvelle-fonctionnalite');
      window.location = encodeURI(
        `/nouvellesFonctionnalites?nouvelleFonctionnalite=${id}`
      );
    }
  );
};

$(() => {
  brancheComportementModaleNouvelleFonctionnalite(
    $('.modale-nouvelles-fonctionnalites')
  );
  brancheComportementAffichageCarrousel();
});

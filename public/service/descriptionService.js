import { brancheElementsAjoutablesDescription } from '../modules/brancheElementsAjoutables.js';
import extraisParametresDescriptionService from '../modules/parametresDescriptionService.mjs';
import initialiseComportementFormulaire from '../modules/soumetsHomologation.mjs';

const messageErreurNomDejaUtilise = {
  affiche: () => {
    $('#nom-deja-utilise').show();
    const $champNomService = $('#nom-service');
    $champNomService
      .get(0)
      .scrollIntoView({ behavior: 'smooth', block: 'center' });
    $champNomService.addClass('invalide');
  },
  masque: () => {
    $('#nom-deja-utilise').hide();
    $('#nom-service').removeClass('invalide');
  },
};

const brancheComportementMessageErreur = () => {
  $('#nom-service').on('keydown', () => {
    messageErreurNomDejaUtilise.masque();
  });
};

const estNomServiceDejaUtilise = (reponseErreur) =>
  reponseErreur.status === 422 &&
  reponseErreur.data?.erreur?.code === 'NOM_SERVICE_DEJA_EXISTANT';

$(() => {
  initialiseComportementFormulaire(
    'form#homologation',
    '.bouton#diagnostic',
    extraisParametresDescriptionService,
    (e) => {
      if (estNomServiceDejaUtilise(e.response)) {
        messageErreurNomDejaUtilise.affiche();
      }
    }
  );
  brancheComportementMessageErreur();

  brancheElementsAjoutablesDescription(
    'donnees-sensibles-specifiques',
    'donnees-sensibles'
  );
  brancheElementsAjoutablesDescription(
    'fonctionnalites-specifiques',
    'fonctionnalite'
  );
  brancheElementsAjoutablesDescription(
    'points-acces',
    'point-acces',
    'exemple : https://www.adresse.fr, adresse IP'
  );
});

import { brancheElementsAjoutablesDescription } from '../modules/brancheElementsAjoutables.js';
import extraisParametresDescriptionService from '../modules/parametresDescriptionService.mjs';
import initialiseComportementFormulaire from '../modules/soumetsHomologation.mjs';
import {
  brancheValidation,
  declencheValidation,
} from '../modules/interactions/validation.mjs';

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

const afficheBanniereMiseAJourSiret = () => {
  const { siret, estEnCreation } = JSON.parse(
    $('#infos-siret-manquant').text()
  );
  if (!estEnCreation && !siret) {
    $('.banniere-avertissement').removeClass('invisible');
  }
};

const brancheComportementMessageErreur = () => {
  $('#nom-service').on('keydown', () => {
    messageErreurNomDejaUtilise.masque();
  });
};

const brancheComportementNombreOrganisationsUtilisatrices = () => {
  const $selection = $('#nombre-organisations-utilisatrices');
  const $conteneur = $('.conteneur-nombre-organisations-utilisatrices');
  $selection.on('change', () => {
    const nouvelleValeur = $selection.val();
    $conteneur.toggleClass('vide', nouvelleValeur === '0-0');
  });
};

const estNomServiceDejaUtilise = (reponseErreur) =>
  reponseErreur.status === 422 &&
  reponseErreur.data?.erreur?.code === 'NOM_SERVICE_DEJA_EXISTANT';

const brancheComportementNavigationEtapes = () => {
  const etapeMin = 1;
  const etapeMax = 2;
  const $boutonPrecedent = $('#etape-precedente');
  const $boutonSuivant = $('#etape-suivante');
  const $conteneurBoutonFinaliser = $('.conteneur-bouton-finaliser');
  let etapeCourante = 1;

  brancheValidation($('#decrire-etape-1'));
  brancheValidation($('#decrire-etape-2'));

  const cacheBouton = ($bouton) => $bouton.css('display', 'none');
  const afficheBouton = ($bouton) => $bouton.css('display', 'flex');

  const afficheEtape = () => {
    $('.etape-decrire').hide();
    $(`#decrire-etape-${etapeCourante}`).show();

    const $entete = $('.marges-fixes');

    $('.avancement-etape p', $entete).text(
      `Étape ${etapeCourante} sur ${etapeMax}`
    );
    if (etapeCourante === etapeMin) cacheBouton($boutonPrecedent);
    else afficheBouton($boutonPrecedent);

    if (etapeCourante === etapeMax) {
      cacheBouton($boutonSuivant);
      afficheBouton($conteneurBoutonFinaliser);
    } else {
      afficheBouton($boutonSuivant);
      cacheBouton($conteneurBoutonFinaliser);
    }

    $entete[0].scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  $boutonPrecedent.on('click', () => {
    etapeCourante = Math.max(etapeCourante - 1, 1);
    afficheEtape();
  });

  $boutonSuivant.on('click', () => {
    const $formulaireEtape = $(`#decrire-etape-${etapeCourante}`);
    declencheValidation($formulaireEtape);
    if ($formulaireEtape[0].checkValidity()) {
      etapeCourante = Math.min(etapeCourante + 1, etapeMax);
      afficheEtape();
    }
  });
};

$(() => {
  afficheBanniereMiseAJourSiret();
  brancheComportementNavigationEtapes();
  initialiseComportementFormulaire(
    '#homologation',
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
  brancheComportementNombreOrganisationsUtilisatrices();
});

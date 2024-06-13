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
  const donneesEtapes = {
    1: {
      titre: 'Présentation du service',
      description:
        "Complétez les informations permettant d'évaluer les besoins de sécurité du service et de proposer <b>des mesures de sécurité adaptées</b>.",
    },
    2: {
      titre: 'Données et fonctionnalités',
      description:
        'Pour mieux comprendre votre service et ses enjeux de protection des données, veuillez répondre aux questions suivantes sur ses <b>fonctionnalités et les données collectées.</b>',
    },
  };

  const etapeMin = 1;
  const etapeMax = 2;
  const $boutonPrecedent = $('#etape-precedente');
  const $boutonSuivant = $('#etape-suivante');
  const $conteneurBoutonFinaliser = $('.conteneur-bouton-finaliser');
  const $entete = $('.conteneur-entete');
  let etapeCourante = 1;

  brancheValidation($('#decrire-etape-1'));
  brancheValidation($('#decrire-etape-2'));

  const cacheBouton = ($bouton) => $bouton.css('display', 'none');
  const afficheBouton = ($bouton) => $bouton.css('display', 'flex');

  const afficheEtape = () => {
    $('.etape-decrire').hide();
    $(`#decrire-etape-${etapeCourante}`).show();

    const $hautDePage = $('.marges-fixes');
    const { titre, description } = donneesEtapes[etapeCourante];

    $('.avancement-etape p', $entete).text(
      `Étape ${etapeCourante} sur ${etapeMax}`
    );
    $('.titre.titre-page h1', $entete).text(titre);
    $('.sous-titre h2', $entete).html(description);
    $('.etape', $entete).removeClass('active');
    for (let i = 1; i <= etapeCourante; i += 1) {
      $(`.etape:nth-child(${i})`, $entete).addClass('active');
    }

    if (etapeCourante === etapeMin) cacheBouton($boutonPrecedent);
    else afficheBouton($boutonPrecedent);

    if (etapeCourante === etapeMax) {
      cacheBouton($boutonSuivant);
      afficheBouton($conteneurBoutonFinaliser);
    } else {
      afficheBouton($boutonSuivant);
      cacheBouton($conteneurBoutonFinaliser);
    }

    $hautDePage[0].scrollIntoView({
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

  $('.etape', $entete).on('click', (e) => {
    const $etape = $(e.target);
    if ($etape.hasClass('active')) {
      etapeCourante = $etape.data('numero-etape');
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

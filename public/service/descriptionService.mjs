import { brancheElementsAjoutablesDescription } from '../modules/brancheElementsAjoutables.js';
import extraisParametresDescriptionService from '../modules/parametresDescriptionService.mjs';
import initialiseComportementFormulaire from '../modules/soumetsHomologation.mjs';
import {
  brancheValidation,
  declencheValidation,
} from '../modules/interactions/validation.mjs';
import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

const $boutonPrecedent = () => $('#etape-precedente');
const $boutonSuivant = () => $('#etape-suivante');
const $conteneurBoutonFinaliser = () => $('.conteneur-bouton-finaliser');

const cacheBouton = ($bouton) => $bouton.css('display', 'none');
const afficheBouton = ($bouton) => $bouton.css('display', 'flex');

const messageErreurNomDejaUtilise = {
  affiche: () => {
    $('#nom-deja-utilise').css('display', 'flex');
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

const brancheComportementNombreOrganisationsUtilisatrices = () => {
  const $selection = $('#nombre-organisations-utilisatrices');
  $selection.on('change', () => {
    $(
      '.banniere-avertissement.miseAJourNombreOrganisationsUtilisatrices'
    ).addClass('invisible');
  });
};

const estNomServiceDejaUtilise = (reponseErreur) =>
  reponseErreur &&
  reponseErreur.status === 422 &&
  reponseErreur.data?.erreur?.code === 'NOM_SERVICE_DEJA_EXISTANT';

const estEnVisiteGuidee = () => {
  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  const visiteGuideeActive =
    etatVisiteGuidee.dejaTerminee === false && !etatVisiteGuidee.enPause;
  const modeVisiteGuidee =
    visiteGuideeActive && etatVisiteGuidee.utilisateurCourant.profilComplet;
  return modeVisiteGuidee;
};

const brancheComportementNavigationEtapes = () => {
  const donneesEtapes = {
    1: {
      titre: 'Présentation du service',
      description:
        "Complétez les informations permettant d'évaluer les besoins de sécurité du service et de proposer <b>des mesures de sécurité adaptées</b>.",
      initialisation: async () => {},
    },
    2: {
      titre: 'Fonctionnalités et données',
      description:
        'Pour mieux comprendre votre service et ses enjeux de protection des données, veuillez répondre aux questions suivantes sur ses <b>fonctionnalités et les données collectées.</b>',
      initialisation: async () => {},
    },
    3: {
      titre: 'Besoins de sécurité',
      description:
        "Sur la base des informations renseignées, l'ANSSI a évalué les <b>besoins de sécurité</b> de votre service. " +
        "Sélectionnez le niveau identifié par l'ANSSI ou un niveau plus élevé puis passez à l'étape suivante pour découvrir la liste de " +
        'mesures de sécurité adaptée à votre service.',
      initialisation: async () => {
        cacheBouton($boutonSuivant());
        cacheBouton($boutonPrecedent());
        cacheBouton($conteneurBoutonFinaliser());

        const niveauRecommandeLectureSeule = lisDonneesPartagees(
          'niveau-securite-recommande-lecture-seule'
        );

        let niveauDeSecuriteMinimal;
        if (niveauRecommandeLectureSeule) {
          niveauDeSecuriteMinimal = niveauRecommandeLectureSeule;
        } else {
          const reponse = await axios({
            method: 'post',
            url: `/api/service/estimationNiveauSecurite`,
            data: extraisParametresDescriptionService('#homologation', true),
          });
          niveauDeSecuriteMinimal = reponse.data.niveauDeSecuriteMinimal;
        }
        $('.icone-chargement', '#decrire-etape-3').hide();

        const niveauSecuriteExistant = lisDonneesPartagees(
          'niveau-securite-existant'
        );

        const lectureSeule = lisDonneesPartagees('decrire-lecture-seule');
        const avecSuggestionBesoinsSecuriteRetrogrades = lisDonneesPartagees(
          'suggestion-controle-besoins-securite-retrogrades'
        );
        const idService = $('.page-service').data('id-service');

        if (!estEnVisiteGuidee()) {
          document.body.dispatchEvent(
            new CustomEvent('svelte-recharge-niveaux-de-securite', {
              detail: {
                niveauDeSecuriteMinimal,
                niveauSecuriteExistant,
                lectureSeule,
                avecSuggestionBesoinsSecuriteRetrogrades,
                idService,
              },
            })
          );
        }
      },
    },
  };

  const etapeMin = 1;
  const etapeMax = Object.keys(donneesEtapes).length;
  const $entete = $('.conteneur-entete');
  let etapeCourante = 1;

  brancheValidation($('#decrire-etape-1'));
  brancheValidation($('#decrire-etape-2'));

  const afficheEtape = async () => {
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

    await donneesEtapes[etapeCourante].initialisation();

    if (etapeCourante === etapeMin) cacheBouton($boutonPrecedent());
    else afficheBouton($boutonPrecedent());

    if (etapeCourante === etapeMax) {
      cacheBouton($boutonSuivant());
      afficheBouton($conteneurBoutonFinaliser());
    } else {
      afficheBouton($boutonSuivant());
      cacheBouton($conteneurBoutonFinaliser());
    }

    if (!estEnVisiteGuidee()) {
      $hautDePage[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  $(document.body).on('jquery-affiche-decrire-etape-3', () => {
    etapeCourante = 3;
    afficheEtape();
  });

  $(document.body).on('jquery-affiche-decrire-etape-1', () => {
    etapeCourante = 1;
    afficheEtape();
  });

  $boutonPrecedent().on('click', () => {
    etapeCourante = Math.max(etapeCourante - 1, 1);
    afficheEtape();
  });

  $boutonSuivant().on('click', () => {
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

  const search = new URLSearchParams(window.location.search);
  if (search.has('etape')) {
    etapeCourante = parseInt(search.get('etape'), 10);
    afficheEtape();
  }

  return {
    afficheEtape1: () => {
      etapeCourante = 1;
      afficheEtape();
    },
    afficheEtapeN: (n) => {
      etapeCourante = n;
      afficheEtape();
    },
  };
};

$(() => {
  const navigationEtapes = brancheComportementNavigationEtapes();
  initialiseComportementFormulaire(
    '#homologation',
    '.bouton#diagnostic',
    extraisParametresDescriptionService,
    navigationEtapes,
    (e, donnees) => {
      if (estNomServiceDejaUtilise(e.response)) {
        messageErreurNomDejaUtilise.affiche();
        navigationEtapes.afficheEtape1();
        $('#niveau-securite-existant').text(`"${donnees.niveauSecurite}"`);
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

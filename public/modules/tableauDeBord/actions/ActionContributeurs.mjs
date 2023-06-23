import ActionAbstraite from './Action.mjs';

const metEnFormeMenuFlotant = ({ peutSupprimer, service, utilisateur }) => {
  let actions = '';
  if (peutSupprimer)
    actions += `
      <li class="action-suppression-contributeur" 
        data-id-service="${service.id}" 
        data-id-contributeur="${utilisateur.id}"
        data-nom-service="${service.nomService}"
        data-nom-contributeur="${utilisateur.prenomNom}">
          Retirer du service
      </li>`;
  return `<div class="menu-flotant"><ul>${actions}</ul></div>`;
};

const metEnFormeLigne = (
  estProprietaire,
  estSupprimable,
  utilisateur,
  service
) =>
  `<li class='ligne-contributeur'>
    <div class='contenu-nom-prenom'>
      <div class='initiale ${
        estProprietaire ? 'proprietaire' : 'contributeur'
      }'>${utilisateur.initiales}</div>
      <div class='nom-prenom-poste'>
        <div class='nom-contributeur'>${utilisateur.prenomNom}</div>
        <div class='poste-contributeur'>${utilisateur.poste}</div>
      </div>
    </div>
    <div class='role ${estProprietaire ? 'proprietaire' : 'contributeur'}'>${
    estProprietaire ? 'Propriétaire' : 'Contributeur'
  }</div>
    ${`<div class="declencheur-menu-flottant ${
      estSupprimable ? '' : 'invisible'
    }">${metEnFormeMenuFlotant({
      peutSupprimer: estSupprimable,
      service,
      utilisateur,
    })}`}
  </li>`;

const metEnFormeProprietaire = (proprietaire) =>
  metEnFormeLigne(true, false, proprietaire);
const metEnFormeContributeur = (estSupprimable, contributeur, service) =>
  metEnFormeLigne(false, estSupprimable, contributeur, service);

class ActionContributeurs extends ActionAbstraite {
  constructor(tableauDesServices) {
    super(tableauDesServices);
    this.appliqueContenu({
      titre: 'Contributeurs',
      texteSimple:
        'Gérer la liste des personnes invitées à contribuer au service sélectionné.',
    });
  }

  initialise(...args) {
    const [idService] = args;
    const service = this.tableauDesServices.donneesDuService(idService);
    const $listeContributeurs = $('#liste-contributeurs');

    $listeContributeurs.show();
    $('#contenu-contributeurs .confirmation-suppression').hide();

    $listeContributeurs.empty();
    $listeContributeurs.append(metEnFormeProprietaire(service.createur));
    service.contributeurs.forEach((contributeur) => {
      $listeContributeurs.append(
        metEnFormeContributeur(
          service.permissions.suppressionContributeur,
          contributeur,
          service
        )
      );
    });

    this.brancheComportementInteractions();
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible() {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  brancheComportementInteractions() {
    $('.declencheur-menu-flottant', '#contenu-contributeurs').on(
      'click',
      (evenement) => {
        const $boutonMenu = $(evenement.target);
        const doitOuvrir = !$boutonMenu.hasClass('actif');
        $('.declencheur-menu-flottant', '#contenu-contributeurs ').removeClass(
          'actif'
        );
        $('.menu-flotant', '#contenu-contributeurs').addClass('invisible');

        if (doitOuvrir) {
          const $menu = $('.menu-flotant', $boutonMenu);
          $boutonMenu.toggleClass('actif');
          $menu.toggleClass('invisible');
        }
      }
    );

    $('.action-suppression-contributeur', '#contenu-contributeurs').on(
      'click',
      (evenement) => {
        const $action = $(evenement.target);
        const $ligneContributeur = $action.parents('.ligne-contributeur');
        const idService = $action.data('id-service');
        const idContributeur = $action.data('id-contributeur');
        const nomService = $action.data('nom-service');
        const nomContributeur = $action.data('nom-contributeur');

        $('#nom-contributeur-suppression').text(`${nomContributeur} `);
        $('#nom-service-contributeur-suppression').html(
          `<strong>${nomService}</strong> `
        );

        $('#liste-contributeurs').hide();
        $('.confirmation-suppression', '#contenu-contributeurs').show();

        $('#confirmation-suppression-contributeur')
          .attr('data-id-service', idService)
          .attr('data-id-contributeur', idContributeur)
          .data('ref-dom-ligne-a-supprimer', $ligneContributeur);
      }
    );
  }

  execute() {
    const $action = $(
      '#confirmation-suppression-contributeur',
      '#contenu-contributeurs'
    );
    const $ligneContributeur = $action.data('ref-dom-ligne-a-supprimer');
    const idService = $action.attr('data-id-service');
    const idContributeur = $action.attr('data-id-contributeur');

    axios
      .delete('/api/autorisation', {
        params: { idHomologation: idService, idContributeur },
      })
      .then(() => {
        $('#liste-contributeurs').show();
        $('.confirmation-suppression', '#contenu-contributeurs').hide();

        $ligneContributeur.fadeOut(200, (element) => $(element).remove());
        this.tableauDesServices.recupereServices();
      });
  }
}

export default ActionContributeurs;

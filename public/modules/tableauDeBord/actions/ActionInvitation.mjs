import ActionAbstraite from './Action.mjs';

const estInvitationDejaEnvoyee = (reponseErreur) =>
  reponseErreur.status === 422 &&
  reponseErreur.data?.erreur?.code === 'INVITATION_DEJA_ENVOYEE';

const metEnFormeLigne = (emailContributeur) =>
  `<li class="contributeur-a-inviter" data-email="${emailContributeur}">
    <img class="avatar-contributeur" src='/statique/assets/images/avatar_invitation_contributeur.svg'>
    <span>${emailContributeur}</span>
    <img class="bouton-suppression-contributeur" src="/statique/assets/images/icone_supprimer_gris.svg">
  </li>`;

class ActionInvitation extends ActionAbstraite {
  constructor(tableauDesServices) {
    super('#contenu-invitation', tableauDesServices);
    this.appliqueContenu({
      titre: 'Inviter des contributeurs',
      texteSimple:
        'Inviter les personnes de votre choix à contribuer à ce service.',
      texteMultiple:
        'Inviter les personnes de votre choix à contribuer à ces services.',
    });
    $('#liste-ajout-contributeur', this.idConteneur).on('click', (e) => {
      const $elementClique = $(e.target);
      if ($elementClique.hasClass('bouton-suppression-contributeur')) {
        const $ligneASupprimer = $elementClique.parent(
          '.contributeur-a-inviter'
        );
        $ligneASupprimer.remove();
      }
    });
  }

  initialise() {
    const $champEmail = $('#email-invitation-collaboration');
    const $listeContributeurs = $('#liste-ajout-contributeur');

    super.initialise();
    $champEmail.val('');
    $('#action-invitation').show();
    $('.message-erreur#invitation-deja-envoyee').hide();
    $listeContributeurs.empty();

    $champEmail.off('keydown');
    $champEmail.on('keydown', (evenement) => {
      if (evenement.key === 'Enter') {
        if (!this.formulaireEstValide) return;

        const nouveauContributeur = $champEmail.val().toLowerCase();
        const contributeursExistants = $.makeArray(
          $('.contributeur-a-inviter', this.idConteneur)
        ).map((el) => $(el).data('email'));
        if (!contributeursExistants.includes(nouveauContributeur)) {
          $listeContributeurs.append(metEnFormeLigne(nouveauContributeur));
        }
        $champEmail.val('');
        $champEmail.addClass('intouche');
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ seulementCreateur }) {
    return seulementCreateur;
  }

  execute() {
    const emailsContributeurs = $.makeArray(
      $('.contributeur-a-inviter', this.idConteneur)
    ).map((el) => $(el).data('email'));

    if (!emailsContributeurs.length) return Promise.reject();

    this.basculeLoader(true);
    $('#action-invitation').hide();

    return Promise.all(
      emailsContributeurs.map((emailContributeur) =>
        axios.post('/api/autorisation', {
          emailContributeur,
          idServices: [...this.tableauDesServices.servicesSelectionnes],
        })
      )
    )
      .then(() => {
        this.tableauDesServices.recupereServices();
        this.basculeLoader(false);
        this.basculeFormulaire(false);
        this.basculeRapport(true);
      })
      .catch((e) => {
        if (estInvitationDejaEnvoyee(e.response)) {
          $('.message-erreur#invitation-deja-envoyee').show();
        }
        $('#action-invitation').show();
        this.basculeLoader(false);
        throw e;
      });
  }
}

export default ActionInvitation;

import { declencheValidation } from '../../interactions/validation.mjs';

const estInvitationDejaEnvoyee = (reponseErreur) =>
  reponseErreur.status === 422 &&
  reponseErreur.data?.erreur?.code === 'INVITATION_DEJA_ENVOYEE';

class ActionInvitation {
  constructor(tableauDesServices) {
    this.tableauDesServices = tableauDesServices;
    this.titre = 'Inviter des contributeurs 1/2';
    this.texteSimple =
      'Inviter les personnes de votre choix à contribuer à ce service.';
    this.texteMultiple =
      'Inviter les personnes de votre choix à contribuer à ces services.';
  }

  // eslint-disable-next-line class-methods-use-this
  initialise() {
    $('#email-invitation-collaboration').val('');
    $('#action-invitation').show();
    $('.message-erreur#invitation-deja-envoyee').hide();
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ estSelectionMultiple, seulementCreateur }) {
    return !estSelectionMultiple && seulementCreateur;
  }

  execute() {
    declencheValidation('#contenu-invitation');
    const $emailInvite = $('#email-invitation-collaboration');

    if (!$emailInvite.is(':valid')) return Promise.reject();

    $('#action-invitation').hide();
    const emailContributeur = $emailInvite.val();
    const invitations = [...this.tableauDesServices.servicesSelectionnes].map(
      (idService) =>
        axios.post('/api/autorisation', {
          emailContributeur,
          idHomologation: idService,
        })
    );
    return Promise.all(invitations)
      .then(() => this.tableauDesServices.recupereServices())
      .catch((e) => {
        if (estInvitationDejaEnvoyee(e.response)) {
          $('.message-erreur#invitation-deja-envoyee').show();
        }
        $('#action-invitation').show();
        throw e;
      });
  }
}

export default ActionInvitation;

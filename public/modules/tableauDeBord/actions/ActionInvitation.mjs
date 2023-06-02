import { declencheValidation } from '../../interactions/validation.mjs';

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
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ estSelectionMultiple, seulementCreateur }) {
    return !estSelectionMultiple && seulementCreateur;
  }

  execute() {
    declencheValidation('#contenu-invitation');
    const $emailInvite = $('#email-invitation-collaboration');

    if (!$emailInvite.is(':valid')) return Promise.resolve();

    $('#action-invitation').prop('disabled', true);
    const emailContributeur = $emailInvite.val();
    const invitations = [...this.tableauDesServices.servicesSelectionnes].map(
      (idService) =>
        axios.post('/api/autorisation', {
          emailContributeur,
          idHomologation: idService,
        })
    );
    return Promise.all(invitations).then(() => {
      $('#action-invitation').prop('disabled', false);
      this.tableauDesServices.recupereServices();
    });
  }
}

export default ActionInvitation;

class ActionInvitationConfirmation {
  constructor() {
    this.titre = 'Inviter des contributeurs 2/2';
    this.texteSimple =
      'Inviter les personnes de votre choix à contribuer à ce service.';
    this.texteMultiple =
      'Inviter les personnes de votre choix à contribuer à ces services.';
  }

  // eslint-disable-next-line class-methods-use-this
  initialise() {}

  // eslint-disable-next-line class-methods-use-this
  estDisponible() {
    return true;
  }
}

export default ActionInvitationConfirmation;

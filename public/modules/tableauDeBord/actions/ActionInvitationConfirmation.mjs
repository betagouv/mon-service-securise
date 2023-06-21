import ActionAbstraite from './Action.mjs';

class ActionInvitationConfirmation extends ActionAbstraite {
  constructor() {
    super();
    this.appliqueContenu({
      titre: 'Inviter des contributeurs 2/2',
      texteSimple:
        'Inviter les personnes de votre choix à contribuer à ce service.',
      texteMultiple:
        'Inviter les personnes de votre choix à contribuer à ces services.',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  initialise() {}

  // eslint-disable-next-line class-methods-use-this
  estDisponible() {
    return true;
  }
}

export default ActionInvitationConfirmation;

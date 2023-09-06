import ActionAbstraite from './Action.mjs';

class ActionContributeurs extends ActionAbstraite {
  constructor() {
    super('#contenu-contributeurs');
    this.appliqueContenu({
      titre: 'Contributeurs',
      texteSimple:
        'Gérer la liste des personnes invitées à contribuer au service sélectionné.',
    });
  }

  initialise({ donneesService }) {
    super.initialise();
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-contributeurs', {
        detail: { services: [donneesService] },
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible() {
    return true;
  }
}

export default ActionContributeurs;

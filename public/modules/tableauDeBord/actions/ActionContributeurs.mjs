import ActionAbstraite from './Action.mjs';

class ActionContributeurs extends ActionAbstraite {
  constructor() {
    super('#contenu-contributeurs');
    this.appliqueContenu({
      titre: 'Gérer les contributeurs',
      texteSimple:
        'Gérer la liste des personnes invitées à contribuer au service.',
      texteMultiple:
        'Gérer la liste des personnes invitées à contribuer aux services.',
    });
  }

  initialise({ donneesServices }) {
    super.initialise();
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-contributeurs', {
        detail: { services: donneesServices },
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ seulementCreateur }) {
    return seulementCreateur;
  }
}

export default ActionContributeurs;

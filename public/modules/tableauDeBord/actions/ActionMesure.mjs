import ActionAbstraite from './Action.mjs';

class ActionMesure extends ActionAbstraite {
  constructor() {
    super('#contenu-mesure');
    this.appliqueContenu({ titre: '', texteSimple: '', texteMultiple: '' });
  }

  initialise({ idService, categories, statuts, mesuresExistantes }) {
    super.initialise();
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-mesure', {
        detail: { idService, categories, statuts, mesuresExistantes },
      })
    );
  }
}

export default ActionMesure;

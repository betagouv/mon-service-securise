import ActionAbstraite from './Action.mjs';

class ActionMesure extends ActionAbstraite {
  constructor(titre = '') {
    super('#contenu-mesure');
    this.appliqueContenu({ titre, texteSimple: '', texteMultiple: '' });
  }

  initialise({
    idService,
    categories,
    statuts,
    priorites,
    retoursUtilisateur,
    estLectureSeule,
    mesuresExistantes,
    mesureAEditer,
  }) {
    super.initialise();
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-mesure', {
        detail: {
          idService,
          categories,
          statuts,
          priorites,
          retoursUtilisateur,
          estLectureSeule,
          mesuresExistantes,
          mesureAEditer,
        },
      })
    );
  }
}

export default ActionMesure;

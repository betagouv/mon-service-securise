import ActionAbstraite from './Action.mjs';
import lisDonneesPartagees from '../../donneesPartagees.mjs';

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
    mesureAEditer,
    modeVisiteGuidee,
  }) {
    super.initialise();
    const nonce = lisDonneesPartagees('nonce-commentaires');
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-mesure', {
        detail: {
          idService,
          categories,
          statuts,
          priorites,
          retoursUtilisateur,
          estLectureSeule,
          mesureAEditer,
          modeVisiteGuidee,
          nonce,
        },
      })
    );
  }
}

export default ActionMesure;

import ActionAbstraite from './Action.mjs';

class ActionTelechargementTamponHomologation extends ActionAbstraite {
  constructor() {
    super('#contenu-telechargement-tampon-homologation');
    this.appliqueContenu({
      titre: "Comment utiliser l'encart d’homologation",
      texteSimple: '',
      texteMultiple: '',
    });
  }

  initialise({ idService }) {
    super.initialise();
    $('#lien-archive-tampon-homologation').attr(
      'href',
      `/api/service/${idService}/archive/tamponHomologation.zip`
    );
  }
}

export default ActionTelechargementTamponHomologation;

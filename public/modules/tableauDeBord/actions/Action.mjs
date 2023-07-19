import {
  brancheValidation,
  declencheValidation,
} from '../../interactions/validation.mjs';

class ActionAbstraite {
  get selecteurFormulaire() {
    return `${this.idConteneur} .conteneur-formulaire`;
  }

  get formulaireEstValide() {
    declencheValidation(this.selecteurFormulaire);
    return $(this.selecteurFormulaire).is(':valid');
  }

  constructor(idConteneur, tableauDesServices) {
    if (this.constructor === ActionAbstraite) {
      throw new TypeError(
        'La classe abstraite "ActionAbstraite" ne peut pas être instanciée directement'
      );
    }
    this.tableauDesServices = tableauDesServices;
    this.idConteneur = idConteneur;
    brancheValidation(this.selecteurFormulaire);
  }

  appliqueContenu({ titre, texteSimple, texteMultiple }) {
    this.titre = titre;
    this.texteSimple = texteSimple;
    this.texteMultiple = texteMultiple;
  }

  basculeConfirmation(visible) {
    const $confirmation = $('.conteneur-confirmation', this.idConteneur);
    $confirmation.toggleClass('invisible', !visible);
  }

  basculeFormulaire(visible) {
    const $formulaire = $('.conteneur-formulaire', this.idConteneur);
    $formulaire.toggleClass('invisible', !visible);
  }

  basculeLoader(visible) {
    const $loader = $('.conteneur-loader', this.idConteneur);
    $loader.toggleClass('invisible', !visible);
  }

  basculeRapport(visible) {
    const $rapport = $('.conteneur-rapport', this.idConteneur);
    $rapport.toggleClass('invisible', !visible);
  }

  initialise() {
    this.basculeFormulaire(true);
    this.basculeLoader(false);
    this.basculeConfirmation(false);
    this.basculeRapport(false);
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible() {
    throw new Error('La méthode "estDisponible" doit être implémentée');
  }

  // eslint-disable-next-line class-methods-use-this
  execute() {
    throw new Error('La méthode "execute" doit être implémentée');
  }
}

export default ActionAbstraite;

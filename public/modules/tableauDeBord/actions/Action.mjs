class ActionAbstraite {
  constructor(tableauDesServices) {
    if (this.constructor === ActionAbstraite) {
      throw new TypeError(
        'La classe abstraite "ActionAbstraite" ne peut pas être instanciée directement'
      );
    }
    this.tableauDesServices = tableauDesServices;
  }

  appliqueContenu({ titre, texteSimple, texteMultiple }) {
    this.titre = titre;
    this.texteSimple = texteSimple;
    this.texteMultiple = texteMultiple;
  }

  // eslint-disable-next-line class-methods-use-this
  initialise() {
    throw new Error('La méthode "initialise" doit être implémentée');
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

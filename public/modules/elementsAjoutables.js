import { brancheAjoutItem, peupleListeItems } from './saisieListeItems.js';

export default class ElementsAjoutables {
  constructor({ nom, valeurExemple = '' }, selecteurConteneur, selecteurDonnees, selecteurLienAjout) {
    this.zoneSaisie = { nom, valeurExemple };
    this.selecteurConteneur = selecteurConteneur;
    this.selecteurDonnees = selecteurDonnees;
    this.selecteurLienAjout = selecteurLienAjout;
    this.indexMax = 0;

    this.peuple();
    this.branche();
  }

  static nouveaux({ nom, valeurExemple = '' }, selecteurConteneur, selecteurDonnees, selecteurLienAjout) {
    return new ElementsAjoutables(
      { nom, valeurExemple }, selecteurConteneur, selecteurDonnees, selecteurLienAjout
    );
  }

  peuple() {
    this.indexMax = peupleListeItems(
      this.selecteurConteneur, this.selecteurDonnees, this.templateZoneSaisie()
    );
  }

  branche() {
    brancheAjoutItem(
      this.selecteurLienAjout,
      this.selecteurConteneur,
      (index) => this.templateZoneSaisie()(index, {}),
      () => (this.indexMax += 1)
    );
  }

  templateZoneSaisie() {
    return (index, { description = '' }) => `
      <input
        id="description-${this.zoneSaisie.nom}-${index}"
        name="description-${this.zoneSaisie.nom}-${index}"
        type="text"
        value="${description}"
        placeholder="${this.zoneSaisie.valeurExemple}"
      >
    `;
  }
}

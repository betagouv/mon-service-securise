import { brancheAjoutItem } from './saisieListeItems.js';

const brancheElementsAjoutables = (identifiantConteneurElements, identifiantElement, valeurExemple = '') => {
  const indexMax = () => {
    const prefixeIdentifiant = `description-${identifiantElement}`;
    const tousLesIndex = $(`[id^="${prefixeIdentifiant}"]`)
      .map((_, element) => parseInt(
        $(element)
          .attr('id')
          .match(`${prefixeIdentifiant}-([0-9]+)`)[1],
        10
      ));

    return Math.max(...tousLesIndex) + 1;
  };

  const selecteurConteneur = `#${identifiantConteneurElements}`;
  const selecteurLienAjout = `#ajout-element-${identifiantElement}`;

  const templateZoneSaisie = (nomElement, valeurExempleElement) => (index, { description = '' }) => `
    <input
      id="description-${nomElement}-${index}"
      name="description-${nomElement}-${index}"
      type="text"
      value="${description}"
      placeholder="${valeurExempleElement}"
    >
  `;

  brancheAjoutItem(
    selecteurLienAjout,
    selecteurConteneur,
    (index) => templateZoneSaisie(identifiantElement, valeurExemple)(index, {}),
    () => indexMax()
  );
};

export default brancheElementsAjoutables;

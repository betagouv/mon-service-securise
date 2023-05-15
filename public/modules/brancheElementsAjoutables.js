import { brancheAjoutItem } from './saisieListeItems.js';

const templateZoneSaisieChampsTextes = (index, nomElement, proprietes) => {
  const label = (valeurLabel, idInputAssocie) =>
    valeurLabel ? `<label for="${idInputAssocie}">${valeurLabel}</label>` : '';

  const $inputs = Object.keys(proprietes).map((cle) => {
    const id = `${cle}-${nomElement}-${index}`;
    return $(
      `${label(proprietes[cle].label, id)}
          <input
            id="${id}"
            name="${id}"
            type="text"
            value="${proprietes[cle].valeur || ''}"
            placeholder="${proprietes[cle].valeurExemple || ''}"
          >`
    );
  });
  return $(`<div id="element-${nomElement}-${index}"></div>`).append($inputs);
};

const brancheElementsAjoutables = (
  identifiantConteneurElements,
  identifiantElement,
  proprietesElement,
  templateZoneSaisie = templateZoneSaisieChampsTextes,
  actionSurZoneSaisieApresAjout = () => {}
) => {
  const indexMax = () => {
    const prefixeIdentifiant = `element-${identifiantElement}`;
    const tousLesIndex = $(`[id^="${prefixeIdentifiant}"]`).map((_, element) =>
      parseInt(
        $(element).attr('id').match(`${prefixeIdentifiant}-([0-9]+)`)[1],
        10
      )
    );

    return Math.max(...tousLesIndex, -1) + 1;
  };

  const selecteurConteneur = `#${identifiantConteneurElements}`;
  const selecteurLienAjout = `#ajout-element-${identifiantElement}`;

  brancheAjoutItem(
    selecteurLienAjout,
    selecteurConteneur,
    (index) => templateZoneSaisie(index, identifiantElement, proprietesElement),
    () => indexMax(),
    actionSurZoneSaisieApresAjout
  );
};

export const brancheElementsAjoutablesDescription = (
  identifiantConteneurElements,
  identifiantElement,
  valeurExemple = ''
) =>
  brancheElementsAjoutables(identifiantConteneurElements, identifiantElement, {
    description: {
      valeur: '',
      valeurExemple,
    },
  });

export default brancheElementsAjoutables;

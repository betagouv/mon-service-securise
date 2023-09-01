import ActionAbstraite from './Action.mjs';

const tableauDeLongueur = (longueur) => [...Array(longueur).keys()];

class ActionDuplication extends ActionAbstraite {
  constructor() {
    super('#contenu-duplication');
    this.appliqueContenu({
      titre: 'Dupliquer',
      texteSimple:
        "Créer une ou plusieurs copies du services sélectionné. Cette copie n'inclut pas les données concernant son homologation.",
    });
  }

  initialise() {
    super.initialise();
    $('#nombre-copie').val(1);
    $('#action-duplication').show();
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ estSelectionMultiple, seulementCreateur }) {
    return !estSelectionMultiple && seulementCreateur;
  }

  async execute({ idService }) {
    const $nombreCopie = $('#nombre-copie');

    if (!this.formulaireEstValide) return Promise.reject();

    this.basculeLoader(true);
    $('#action-duplication').hide();

    const nombreCopies = parseInt($nombreCopie.val(), 10) || 1;
    const uneCopie = () =>
      axios({ method: 'copy', url: `/api/service/${idService}` });

    const copies = tableauDeLongueur(nombreCopies).reduce(
      (acc) => acc.then(() => uneCopie()),
      Promise.resolve()
    );

    try {
      return await copies;
    } catch (exc) {
      const { data, status } = exc.response;

      if (status === 424 && data.type === 'DONNEES_OBLIGATOIRES_MANQUANTES') {
        this.basculeFormulaire(false);
        const urlDecrire = `/service/${idService}/descriptionService`;
        $('#aller-dans-decrire').attr('href', urlDecrire);
        this.basculeRapport(true);
      }

      throw exc;
    }
  }
}

export default ActionDuplication;

import ActionAbstraite from './Action.mjs';
import { declencheValidation } from '../../interactions/validation.mjs';

const tableauDeLongueur = (longueur) => [...Array(longueur).keys()];

class ActionDuplication extends ActionAbstraite {
  constructor(tableauDesServices) {
    super('#contenu-duplication', tableauDesServices);
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

  execute() {
    declencheValidation(this.idConteneur);
    const $nombreCopie = $('#nombre-copie');

    if (!$nombreCopie.is(':valid')) return Promise.resolve();

    this.basculeLoader(true);
    $('#action-duplication').hide();

    const nombreCopies = parseInt($nombreCopie.val(), 10) || 1;
    const uneCopie = () =>
      axios({ method: 'copy', url: `/api/service/${this.idSelectionne()}` });

    const copies = tableauDeLongueur(nombreCopies).reduce(
      (acc) => acc.then(() => uneCopie()),
      Promise.resolve()
    );

    return copies
      .then(() => this.tableauDesServices.recupereServices())
      .catch((exc) => {
        const { data, status } = exc.response;

        if (status === 424 && data.type === 'DONNEES_OBLIGATOIRES_MANQUANTES') {
          this.basculeFormulaire(false);
          const urlDecrire = `/service/${this.idSelectionne()}/descriptionService`;
          $('#aller-dans-decrire').attr('href', urlDecrire);
          this.basculeRapport(true);
        }

        throw exc;
      });
  }

  idSelectionne() {
    return this.tableauDesServices.servicesSelectionnes.keys().next().value;
  }
}

export default ActionDuplication;

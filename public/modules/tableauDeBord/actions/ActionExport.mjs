class ActionExport {
  constructor(tableauDesServices) {
    this.tableauDesServices = tableauDesServices;
    this.titre = 'Exporter la sélection';
    this.texteSimple =
      'Télécharger les données du service sélectionné dans le tableau de bord.';
    this.texteMultiple =
      'Télécharger la liste des services sélectionnés dans le tableau de bord.';
  }

  // eslint-disable-next-line class-methods-use-this
  initialise() {}

  execute() {
    window.open(
      `/api/services/export.csv?idsServices=${encodeURIComponent(
        JSON.stringify([...this.tableauDesServices.servicesSelectionnes])
      )}`,
      '_blank'
    );
  }
}

export default ActionExport;

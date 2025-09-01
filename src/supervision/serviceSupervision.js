class ServiceSupervision {
  constructor({ depotDonnees, adaptateurSupervision }) {
    if (!depotDonnees || !adaptateurSupervision) {
      throw new Error(
        "Impossible d'instancier le service de supervision sans ses dépendances"
      );
    }
    this.depotDonnees = depotDonnees;
    this.adaptateurSupervision = adaptateurSupervision;
  }

  async delieServiceEtSuperviseurs(idService) {
    await this.adaptateurSupervision.delieServiceDesSuperviseurs(idService);
  }

  genereURLSupervision(idSuperviseur, filtres) {
    return this.adaptateurSupervision.genereURLSupervision(
      idSuperviseur,
      filtres
    );
  }

  async relieServiceEtSuperviseurs(service) {
    const superviseurs = await this.depotDonnees.lisSuperviseurs(
      service.siretDeOrganisation()
    );

    if (!superviseurs.length) return;

    await this.adaptateurSupervision.relieSuperviseursAService(
      service,
      superviseurs
    );
  }

  async modifieLienServiceEtSuperviseurs(service) {
    await this.delieServiceEtSuperviseurs(service.id);
    await this.relieServiceEtSuperviseurs(service);
  }

  async revoqueSuperviseur(idUtilisateur) {
    await this.adaptateurSupervision.revoqueSuperviseur(idUtilisateur);
    await this.depotDonnees.revoqueSuperviseur(idUtilisateur);
  }
}

export default ServiceSupervision;

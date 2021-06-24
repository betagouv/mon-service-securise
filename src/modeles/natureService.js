class NatureService {
  constructor(id, referentiel) {
    this.id = id;
    this.referentiel = referentiel;
  }

  description() {
    return this.referentiel.natureService[this.id];
  }
}

module.exports = NatureService;

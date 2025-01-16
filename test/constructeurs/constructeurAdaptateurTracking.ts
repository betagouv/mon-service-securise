class ConstructeurAdaptateurTracking {
  constructor() {
    this.envoieTrackingNouveauServiceCree = () => {};
    this.envoieTrackingCompletudeService = () => {};
  }

  avecEnvoiTrackingCompletude(envoiTrackingCompletude) {
    this.envoieTrackingCompletudeService = envoiTrackingCompletude;
    return this;
  }

  avecEnvoiTrackingNouveauServiceCree(envoiTrackingNouveauServiceCree) {
    this.envoieTrackingNouveauServiceCree = envoiTrackingNouveauServiceCree;
    return this;
  }

  construis() {
    return {
      envoieTrackingNouveauServiceCree: this.envoieTrackingNouveauServiceCree,
      envoieTrackingCompletudeService: this.envoieTrackingCompletudeService,
    };
  }
}

const unAdaptateurTracking = () => new ConstructeurAdaptateurTracking();

module.exports = { unAdaptateurTracking };

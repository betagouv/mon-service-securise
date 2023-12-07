// eslint-disable-next-line max-classes-per-file
const expect = require('expect.js');
const BusEvenements = require('../../src/bus/busEvenements');

class EvenementTestA {
  constructor(increment) {
    this.increment = increment;
  }
}

class EvenementTestB {}

describe("Le bus d'événements", () => {
  const creeBusEvenements = (
    adaptateurGestionErreur = { logueErreur: () => {} }
  ) => new BusEvenements({ adaptateurGestionErreur });

  it("permet de s'abonner à un type d'événement", () => {
    let compteur = 0;

    const bus = creeBusEvenements();
    bus.abonne(EvenementTestA, () => {
      compteur += 1;
    });

    bus.publie(new EvenementTestA());

    expect(compteur).to.be(1);
  });

  it('fait la différence entre les événements', () => {
    let compteur = 0;

    const bus = creeBusEvenements();
    bus.abonne(EvenementTestA, () => {
      compteur += 1;
    });
    bus.abonne(EvenementTestB, () => {
      compteur += 100;
    });

    bus.publie(new EvenementTestA());

    expect(compteur).to.be(1);
  });

  it("appelle tous les abonnés du type d'événement publié", async () => {
    let compteur = 0;

    const bus = creeBusEvenements();
    bus.abonne(EvenementTestA, () => {
      compteur += 1;
    });
    bus.abonne(EvenementTestA, () => {
      compteur += 10;
    });

    await bus.publie(new EvenementTestA());

    expect(compteur).to.be(11);
  });

  it("passe l'événement reçu en paramètre aux abonnés", () => {
    let compteur = 0;

    const bus = creeBusEvenements();
    bus.abonne(EvenementTestA, (e) => {
      compteur += e.increment;
    });

    bus.publie(new EvenementTestA(30));

    expect(compteur).to.be(30);
  });

  it("éxecute tous les handlers même en cas d'exception", () => {
    let compteur = 0;

    const bus = creeBusEvenements({ logueErreur: () => {} });
    bus.abonne(EvenementTestA, () => {
      throw new Error('BOUM');
    });
    bus.abonne(EvenementTestA, () => {
      compteur += 1;
    });

    bus.publie(new EvenementTestA());

    expect(compteur).to.be(1);
  });

  it("envoie les erreurs des handlers à l'adaptateur de gestion d'erreur", () => {
    let erreurEnregistree;

    const bus = creeBusEvenements({
      logueErreur: (e) => {
        erreurEnregistree = e;
      },
    });
    bus.abonne(EvenementTestA, () => {
      throw new Error('BOUM');
    });

    bus.publie(new EvenementTestA());

    expect(erreurEnregistree).to.eql(new Error('BOUM'));
  });

  it('éxecute des handlers asynchrones', (done) => {
    let compteur = 0;

    const bus = creeBusEvenements();
    bus.abonne(EvenementTestA, () =>
      Promise.resolve().then(() => (compteur += 1))
    );

    bus.publie(new EvenementTestA()).then(() => {
      expect(compteur).to.be(1);
      done();
    });
  });
});

// eslint-disable-next-line max-classes-per-file
import expect from 'expect.js';

import BusEvenements from '../../src/bus/busEvenements.js';
import { ErreurBusEvenements } from '../../src/erreurs.js';

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

  it("permet de s'abonner à un type d'événement", async () => {
    let compteur = 0;

    const bus = creeBusEvenements();
    bus.abonne(EvenementTestA, async () => {
      compteur += 1;
    });

    await bus.publie(new EvenementTestA());

    expect(compteur).to.be(1);
  });

  it("permet d'ajouter plusieurs abonnés en un seul appel", async () => {
    let compteur = 0;

    const bus = creeBusEvenements();
    bus.abonnePlusieurs(EvenementTestA, [
      async () => (compteur += 1),
      async () => (compteur += 10),
    ]);

    await bus.publie(new EvenementTestA());

    expect(compteur).to.be(11);
  });

  it('fait la différence entre les événements', async () => {
    let compteur = 0;

    const bus = creeBusEvenements();
    bus.abonne(EvenementTestA, async () => {
      compteur += 1;
    });
    bus.abonne(EvenementTestB, async () => {
      compteur += 100;
    });

    await bus.publie(new EvenementTestA());

    expect(compteur).to.be(1);
  });

  it("appelle tous les abonnés du type d'événement publié", async () => {
    let compteur = 0;

    const bus = creeBusEvenements();
    bus.abonne(EvenementTestA, async () => {
      compteur += 1;
    });
    bus.abonne(EvenementTestA, async () => {
      compteur += 10;
    });

    await bus.publie(new EvenementTestA());

    expect(compteur).to.be(11);
  });

  it("passe l'événement reçu en paramètre aux abonnés", async () => {
    let compteur = 0;

    const bus = creeBusEvenements();
    bus.abonne(EvenementTestA, async (e) => {
      compteur += e.increment;
    });

    await bus.publie(new EvenementTestA(30));

    expect(compteur).to.be(30);
  });

  it("éxecute tous les handlers même en cas d'exception", async () => {
    let compteur = 0;

    const bus = creeBusEvenements({ logueErreur: () => {} });
    bus.abonne(EvenementTestA, async () => {
      throw new Error('BOUM');
    });
    bus.abonne(EvenementTestA, async () => {
      compteur += 1;
    });

    await bus.publie(new EvenementTestA());

    expect(compteur).to.be(1);
  });

  it("logue les erreurs des abonnés, sans oublier la cause de l'erreur", async () => {
    let erreurEnregistree;

    const bus = creeBusEvenements({
      logueErreur: (e) => {
        erreurEnregistree = e;
      },
    });
    bus.abonne(EvenementTestA, async () => {
      throw new Error('BOOM DANS ABONNÉ');
    });

    await bus.publie(new EvenementTestA());

    expect(erreurEnregistree).to.be.an(ErreurBusEvenements);
    expect(erreurEnregistree.message).to.be(
      'Erreur dans un abonné à [EvenementTestA]'
    );
    expect(erreurEnregistree.cause).to.be.an(Error);
    expect(erreurEnregistree.cause.message).to.be('BOOM DANS ABONNÉ');
  });

  it("reste robuste si aucun handler n'existe pour l'événement", async () => {
    const bus = creeBusEvenements();

    // On veut juste vérifier que cette ligne ne jette aucune exception
    await bus.publie(new EvenementTestA());
  });
});

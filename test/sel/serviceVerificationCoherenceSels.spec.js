const expect = require('expect.js');
const {
  fabriqueServiceVerificationCoherenceSels,
} = require('../../src/sel/serviceVerificationCoherenceSels');
const { ErreurHashDeSelInvalide } = require('../../src/erreurs');

describe('Le service de vérification de cohérence des sels de hashage', () => {
  describe('sur demande de vérification des sels', () => {
    let serviceVerificationCoherenceSels;
    let depotDonnees;
    let adaptateurEnvironnement;

    beforeEach(() => {
      depotDonnees = {
        verifieLaCoherenceDesSels: () => undefined,
      };
      adaptateurEnvironnement = {
        modeMaintenance: () => ({
          actif: () => false,
        }),
      };
      serviceVerificationCoherenceSels =
        fabriqueServiceVerificationCoherenceSels({
          depotDonnees,
          adaptateurEnvironnement,
        });
    });

    it('ne fait rien si les sels sont cohérents', async () => {
      try {
        await serviceVerificationCoherenceSels.verifieLaCoherenceDesSels();
      } catch (e) {
        expect().fail(e);
      }
    });

    describe('lorsque les sels sont incohérents', () => {
      let exitActuel;

      beforeEach(() => {
        exitActuel = process.exit;
      });

      afterEach(() => {
        process.exit = exitActuel;
      });

      it("termine l'application", async () => {
        let codeRecu;
        process.exit = (codeDeRetour) => (codeRecu = codeDeRetour);

        depotDonnees.verifieLaCoherenceDesSels = () => {
          throw new ErreurHashDeSelInvalide();
        };

        await serviceVerificationCoherenceSels.verifieLaCoherenceDesSels();

        expect(codeRecu).to.be(1);
      });

      it("écrit l'erreur sur la console", async () => {
        const sortieStandardActuelle = process.stdout;
        let erreurRecue;
        process.exit = () => undefined;
        process.stdout.write = (e) => (erreurRecue = e);

        depotDonnees.verifieLaCoherenceDesSels = () => {
          throw new ErreurHashDeSelInvalide(
            'La version 1 du sel est invalide.'
          );
        };

        await serviceVerificationCoherenceSels.verifieLaCoherenceDesSels();

        expect(erreurRecue).to.be(
          'Erreur de vérification des sels: La version 1 du sel est invalide.\n'
        );

        process.stdout = sortieStandardActuelle;
      });
    });

    describe("lorsqu'il y a un nouveau sel", () => {
      beforeEach(() => {
        depotDonnees.verifieLaCoherenceDesSels = () => ({ version: 1 });
      });

      it("termine l'application si elle n'est pas en mode 'maintenance'", async () => {
        const exitActuel = process.exit;
        let codeRecu;
        process.exit = (codeDeRetour) => (codeRecu = codeDeRetour);

        adaptateurEnvironnement.modeMaintenance.actif = () => false;

        await serviceVerificationCoherenceSels.verifieLaCoherenceDesSels();

        expect(codeRecu).to.be(1);
        process.exit = exitActuel;
      });

      it("ne fait rien si l'application est en mode maintenance", async () => {
        const exitActuel = process.exit;
        let codeRecu;
        process.exit = (codeDeRetour) => (codeRecu = codeDeRetour);
        adaptateurEnvironnement.modeMaintenance = () => ({ actif: () => true });

        await serviceVerificationCoherenceSels.verifieLaCoherenceDesSels();
        expect(codeRecu).to.be(undefined);

        process.exit = exitActuel;
      });
    });
  });
});

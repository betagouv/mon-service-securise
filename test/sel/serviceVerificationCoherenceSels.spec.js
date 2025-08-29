import expect from 'expect.js';
import { fabriqueServiceVerificationCoherenceSels } from '../../src/sel/serviceVerificationCoherenceSels.js';
import { ErreurHashDeSelInvalide } from '../../src/erreurs.js';

describe('Le service de vérification de cohérence des sels de hashage', () => {
  describe('sur demande de vérification des sels', () => {
    let serviceVerificationCoherenceSels;
    let depotDonnees;
    let adaptateurEnvironnement;
    let consoleLogActuel;
    let exitActuel;
    let stdoutActuel;

    /* eslint-disable no-console */
    beforeEach(() => {
      depotDonnees = {
        verifieLaCoherenceDesSels: () => {},
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
      consoleLogActuel = console.log;
      console.log = () => {};
      exitActuel = process.exit;
      process.exit = () => {};
      stdoutActuel = process.stdout.write;
    });

    afterEach(() => {
      console.log = consoleLogActuel;
      process.exit = exitActuel;
      process.stdout.write = stdoutActuel;
    });
    /* eslint-enable no-console */

    it("ne fait rien si l'application est en mode maintenance", async () => {
      let depotAppele = false;
      depotDonnees.verifieLaCoherenceDesSels = () => {
        depotAppele = true;
      };
      adaptateurEnvironnement.modeMaintenance = () => ({ actif: () => true });

      await serviceVerificationCoherenceSels.verifieLaCoherenceDesSels();
      expect(depotAppele).to.be(false);
    });

    it('ne fait rien si les sels sont cohérents', async () => {
      try {
        await serviceVerificationCoherenceSels.verifieLaCoherenceDesSels();
      } catch (e) {
        expect().fail(e);
      }
    });

    describe('lorsque les sels sont incohérents', () => {
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
          '💥 Erreur de vérification des sels: La version 1 du sel est invalide.\n'
        );
      });
    });
  });
});

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repertoireDeCeFichier = path.dirname(fileURLToPath(import.meta.url));
const racineDuProjet = path.resolve(repertoireDeCeFichier, '../../../..');

const cheminDuScript = path.join(
  racineDuProjet,
  'scripts/moteurRisques/transformeCSVPourVraisemblance.sh'
);

const identifiantRisque = 'risqueDeTest';
const cheminFichierGenere = path.join(
  racineDuProjet,
  `src/moteurRisques/v2/vraisemblance/vraisemblance.${identifiantRisque}.configuration.ts`
);

describe('le script qui transforme le CSV pour la vraisemblance', () => {
  let repertoireTemporaire: string;
  let cheminCSV: string;

  beforeEach(() => {
    repertoireTemporaire = mkdtempSync(path.join(tmpdir(), 'vraisemblance-'));
    cheminCSV = path.join(repertoireTemporaire, 'vraisemblance.csv');
  });

  afterEach(() => {
    rmSync(repertoireTemporaire, { recursive: true, force: true });
    rmSync(cheminFichierGenere, { force: true });
  });

  const ecrisCSVAvecFormuleBasique = (formuleBasique: string) =>
    writeFileSync(
      cheminCSV,
      [
        'REF,Basique : Réduction,Modéré : Réduction,Avancé : Réduction',
        `CALCUL,${formuleBasique},,`,
      ].join('\n')
    );

  const executeLeScript = () =>
    execFileSync('bash', [cheminDuScript, cheminCSV, identifiantRisque], {
      stdio: 'pipe',
    });

  it("s'exécute", () => {
    ecrisCSVAvecFormuleBasique('V = 5 - a(SI TOUT)');

    expect(() => executeLeScript()).not.toThrow();
  });

  describe('en cas de formule avec un espace avant une parenthère', () => {
    beforeEach(() => {
      ecrisCSVAvecFormuleBasique('V = 5 - a (SI TOUT)');
    });

    it('échoue', () => {
      expect(() => executeLeScript()).toThrow();
    });

    it('ne génère pas de fichier Typescript', () => {
      try {
        executeLeScript();
      } catch {
        // On attend l'échec : c'est l'objet du test suivant (absence de fichier).
      }

      expect(existsSync(cheminFichierGenere)).toBe(false);
    });

    it("signale la formule fautive dans le message d'erreur", () => {
      let sortieErreur = '';
      try {
        executeLeScript();
      } catch (erreur) {
        sortieErreur = String((erreur as { stderr?: Buffer }).stderr);
      }

      expect(sortieErreur).toContain('Formule mal formée');
      expect(sortieErreur).toContain('V = 5 - a (SI TOUT)');
    });
  });
});

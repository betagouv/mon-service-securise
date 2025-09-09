import { MoteurReglesV2 } from '../src/moteurReglesV2.js';
import { creeReferentiel } from '../src/referentiel.js';

describe('Le moteur de règles V2', () => {
  it('renvoie les mesures qui sont dans le socle initial si elles ne sont pas exclues ensuite', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      { reference: 'PSSI.1', dansSocleInitial: true },
    ]);

    const mesures = v2.mesures();

    expect(mesures).toEqual({ 'PSSI.1': {} });
  });
});

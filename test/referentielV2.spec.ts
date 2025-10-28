import { creeReferentielV2 } from '../src/referentielV2.js';
import { creeReferentiel } from '../src/referentiel.js';

describe('Le référentiel V2', () => {
  it('utilise les méthodes du référentiel v1 dans le cas général', () => {
    const referentielV2 = creeReferentielV2();
    const referentielV1 = creeReferentiel();

    expect(referentielV2.versionActuelleCgu()).toEqual(
      referentielV1.versionActuelleCgu()
    );
  });

  it('retourne v2 comme version de référentiel', () => {
    const referentielV2 = creeReferentielV2();

    expect(referentielV2.version()).toEqual('v2');
  });
});

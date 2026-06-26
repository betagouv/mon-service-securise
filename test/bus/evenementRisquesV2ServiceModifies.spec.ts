import { EvenementRisquesV2ServiceModifies } from '../../src/bus/evenementRisquesV2ServiceModifies.ts';
import { unUUIDRandom } from '../constructeurs/UUID.ts';

describe("L'événement `Risques v2 modifiés`", () => {
  it("lève une exception s'il est instancié sans ID de service", () => {
    expect(
      () =>
        // @ts-expect-error On fait exprès d'omettre un argument
        new EvenementRisquesV2ServiceModifies(null)
    ).toThrow('ID Service');
  });

  it("lève une exception s'il est instancié sans risques", () => {
    expect(
      // @ts-expect-error On fait exprès d'omettre un argument
      () => new EvenementRisquesV2ServiceModifies(unUUIDRandom(), null)
    ).toThrow('risques');
  });
});

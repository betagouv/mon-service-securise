import PointsAcces from '../../src/modeles/pointsAcces.js';

describe("Les points d'accès", () => {
  it("se construisent avec le bon nom d'item", () => {
    const pointsAcces = new PointsAcces({ pointsAcces: [] });

    expect(pointsAcces.nombre()).toEqual(0);
  });
});

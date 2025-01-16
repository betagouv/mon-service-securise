const expect = require('expect.js');

const PointsAcces = require('../../src/modeles/pointsAcces');

const ils = it;

describe("Les points d'accès", () => {
  ils("se construisent avec le bon nom d'item", () => {
    const pointsAcces = new PointsAcces({ pointsAcces: [] });

    expect(pointsAcces.nombre()).to.equal(0);
  });
});

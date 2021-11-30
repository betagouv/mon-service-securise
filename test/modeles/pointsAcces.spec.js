const expect = require('expect.js');

const PointsAcces = require('../../src/modeles/pointsAcces');

const ils = it;

describe("Les points d'accès", () => {
  ils('savent se dénombrer', () => {
    const pointsAcces = new PointsAcces({ pointsAcces: [
      { description: "Un point d'accès" },
      { description: "Un autre point d'accès" },
    ] });

    expect(pointsAcces.nombre()).to.equal(2);
  });
});

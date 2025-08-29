import expect from 'expect.js';
import PointsAcces from '../../src/modeles/pointsAcces.js';

const ils = it;

describe("Les points d'accès", () => {
  ils("se construisent avec le bon nom d'item", () => {
    const pointsAcces = new PointsAcces({ pointsAcces: [] });

    expect(pointsAcces.nombre()).to.equal(0);
  });
});

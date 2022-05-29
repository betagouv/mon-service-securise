import expect from 'expect.js';

import construis from '../../../public/modules/statistiques/construis.mjs';

describe('La construction des données statistiques', () => {
  it('prépare le jeu de données pour chart.js', () => {
    const donnees = {
      '2022-01-01': { stat1: 15, stat2: 26 },
      '2022-12-31': { stat1: 209, stat2: 1789 },
    };

    expect(construis('stat2', donnees)).to.eql([
      { x: '2022-01-01', y: 26 },
      { x: '2022-12-31', y: 1789 },
    ]);
  });
});

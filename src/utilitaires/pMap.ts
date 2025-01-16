const pmap = require('p-map');

const avecPMapPourChaqueElement = (itemsDansPromesse, fonctionAAppliquer) =>
  itemsDansPromesse.then((items) =>
    pmap(items, fonctionAAppliquer, { concurrency: 2 })
  );
module.exports = { avecPMapPourChaqueElement };

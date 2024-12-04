const avecPMapPourChaqueElement = (itemsDansPromesse, fonctionAAppliquer) =>
  import('p-map').then((module) => {
    const pMap = module.default;

    return itemsDansPromesse.then((items) =>
      pMap(items, fonctionAAppliquer, { concurrency: 2 })
    );
  });

module.exports = { avecPMapPourChaqueElement };

import pmap from 'p-map';

const avecPMap = (items, fonctionAAppliquer) =>
  pmap(items, fonctionAAppliquer, { concurrency: 2 });

const avecPMapPourChaqueElement = (itemsDansPromesse, fonctionAAppliquer) =>
  itemsDansPromesse.then((items) => avecPMap(items, fonctionAAppliquer));

const avecPMapPourChaqueElementSansPromesse = (items, fonctionAAppliquer) =>
  avecPMap(items, fonctionAAppliquer);

export { avecPMapPourChaqueElement, avecPMapPourChaqueElementSansPromesse };

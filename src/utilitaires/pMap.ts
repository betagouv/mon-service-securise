import pmap from 'p-map';

const avecPMap = <TEntree, TSortie>(
  items: Iterable<TEntree>,
  fonctionAAppliquer: pmap.Mapper<TEntree, TSortie>
) => pmap(items, fonctionAAppliquer, { concurrency: 2 });

export const avecPMapPourChaqueElement = <TEntree, TSortie>(
  itemsDansPromesse: Promise<TEntree[]>,
  fonctionAAppliquer: pmap.Mapper<TEntree, TSortie>
) => itemsDansPromesse.then((items) => avecPMap(items, fonctionAAppliquer));

export const avecPMapPourChaqueElementSansPromesse = <TEntree, TSortie>(
  items: Iterable<TEntree>,
  fonctionAAppliquer: pmap.Mapper<TEntree, TSortie>
) => avecPMap(items, fonctionAAppliquer);

import pMap, { type Mapper } from 'p-map';

const avecPMap = <TEntree, TSortie>(
  items: Iterable<TEntree>,
  fonctionAAppliquer: Mapper<TEntree, TSortie>
) => pMap(items, fonctionAAppliquer, { concurrency: 2 });

export const avecPMapPourChaqueElement = <TEntree, TSortie>(
  itemsDansPromesse: Promise<TEntree[]>,
  fonctionAAppliquer: Mapper<TEntree, TSortie>
) => itemsDansPromesse.then((items) => avecPMap(items, fonctionAAppliquer));

export const avecPMapPourChaqueElementSansPromesse = <TEntree, TSortie>(
  items: Iterable<TEntree>,
  fonctionAAppliquer: Mapper<TEntree, TSortie>
) => avecPMap(items, fonctionAAppliquer);

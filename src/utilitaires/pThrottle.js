import pThrottle from 'p-throttle';

const enCadence = (intervalleEnMs, fonctionEncapsulee) => {
  const cadence = pThrottle({ limit: 1, interval: intervalleEnMs });
  return cadence(fonctionEncapsulee);
};

export { enCadence };

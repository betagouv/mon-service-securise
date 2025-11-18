import pThrottle from 'p-throttle';

export const enCadence = (
  intervalleEnMs: number,
  fonctionEncapsulee: () => void
) => {
  const cadence = pThrottle({ limit: 1, interval: intervalleEnMs });
  return cadence(fonctionEncapsulee);
};

import pThrottle from 'p-throttle';

export const enCadence = <TArguments extends unknown[], TResultat = void>(
  intervalleEnMs: number,
  fonctionEncapsulee: (...args: TArguments) => Promise<TResultat>
): ((...args: TArguments) => Promise<TResultat>) => {
  const cadence = pThrottle({ limit: 1, interval: intervalleEnMs });
  return cadence(fonctionEncapsulee);
};

const pThrottle = require('p-throttle');

// Import dynamique car `p-throttle` ne support que `import from` que nous ne supportons pas.
const enCadence = (intervalleEnMs, fonctionEncapsulee) => {
  const cadence = pThrottle({ limit: 1, interval: intervalleEnMs });
  return cadence(fonctionEncapsulee);
};

module.exports = { enCadence };

const MILISECONDES_DANS_UNE_JOURNEE = 1000 * 3600 * 24;

export const formatteDifferenceDateRelative = (chaineDate: string) => {
  const dateAComparer = new Date(chaineDate);
  const maintenant = new Date();
  const differenceEnJours = Math.round(
    (dateAComparer.getTime() - maintenant.getTime()) /
      MILISECONDES_DANS_UNE_JOURNEE
  );

  const formatter = new Intl.RelativeTimeFormat('fr-FR', {
    localeMatcher: 'best fit',
    numeric: 'auto',
    style: 'long',
  });

  let donneesFormat: {
    difference: number;
    unite: Intl.RelativeTimeFormatUnit;
  };
  const differenceAbsolue = Math.abs(differenceEnJours);
  if (differenceAbsolue >= 365) {
    donneesFormat = {
      difference: Math.floor(differenceEnJours / 365),
      unite: 'year',
    };
  } else if (differenceAbsolue >= 31) {
    donneesFormat = {
      difference: Math.floor(differenceEnJours / 31),
      unite: 'month',
    };
  } else if (differenceAbsolue >= 7)
    donneesFormat = {
      difference: Math.floor(differenceEnJours / 7),
      unite: 'week',
    };
  else {
    donneesFormat = { difference: differenceEnJours, unite: 'day' };
  }

  const dateFormattee = formatter.format(
    donneesFormat.difference,
    donneesFormat.unite
  );
  return dateFormattee.charAt(0).toUpperCase() + dateFormattee.slice(1);
};

export const formatteDateHeureFr = (dateHeure: Date) =>
  new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .formatToParts(dateHeure)
    .map((o) => (o.value === ', ' ? ' à ' : o.value === ':' ? 'h' : o.value))
    .join('');

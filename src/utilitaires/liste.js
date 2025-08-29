const formatteListeFr = (liste) =>
  new Intl.ListFormat('fr', {
    style: 'long',
    type: 'conjunction',
  }).format(liste);

export { formatteListeFr };

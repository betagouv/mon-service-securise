const formatteListeFr = (liste) =>
  new Intl.ListFormat('fr', {
    style: 'long',
    type: 'conjunction',
  }).format(liste);

module.exports = { formatteListeFr };

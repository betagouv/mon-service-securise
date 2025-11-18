export const formatteListeFr = (liste: Iterable<string>) =>
  new Intl.ListFormat('fr', {
    style: 'long',
    type: 'conjunction',
  }).format(liste);

export const dateEnFrancais = (chaineDateISO: string) =>
  chaineDateISO
    ? new Date(chaineDateISO).toLocaleString('fr-FR', { dateStyle: 'short' })
    : '';

export const dateEnFrancais = (chaineDateISO: string) =>
  chaineDateISO
    ? new Date(chaineDateISO).toLocaleString('fr-FR', { dateStyle: 'short' })
    : '';

export const dateEnFrancaisLongue = (chaineDateISO: string) =>
  chaineDateISO
    ? new Date(chaineDateISO).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '';

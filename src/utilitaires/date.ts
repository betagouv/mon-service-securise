const ajouteMoisADate = (nbMois: number, chaineDate: string | Date) => {
  const date = new Date(chaineDate);
  const jour = date.getDate();

  const depassementJourMoisSuivant = () => date.getDate() !== jour;
  const reviensFinMoisPrecedent = () => date.setDate(0);

  date.setMonth(date.getMonth() + nbMois);
  if (depassementJourMoisSuivant()) {
    reviensFinMoisPrecedent();
  }
  return date;
};

const dateEnFrancais = (chaineDate: string) => {
  const date = new Date(chaineDate);
  return date.toLocaleString('fr-FR', { dateStyle: 'short' });
};

const dateEnIso = (chaineDate: string) => {
  const date = new Date(chaineDate);
  // On utilise le standard canadien pour obtenir le format YYYY-MM-DD
  return date.toLocaleString('fr-CA', { dateStyle: 'short' });
};

const dateYYYYMMDD = (date: string) => dateEnIso(date).replaceAll('-', '');

const dateInvalide = (chaineDate: string) =>
  Number.isNaN(new Date(chaineDate).valueOf());

const chaineDateFrEnChaineDateISO = (chaineDateFr: string) => {
  const [jour, mois, annee] = chaineDateFr.split('/');
  return `${annee}-${mois}-${jour}`;
};

export {
  ajouteMoisADate,
  dateEnFrancais,
  dateEnIso,
  chaineDateFrEnChaineDateISO,
  dateInvalide,
  dateYYYYMMDD,
};

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

const dateEnFrancais = (chaineDate: string | Date) => {
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

const secondesJusqua23h59m59s = (moment: Date) => {
  const finDuJour = new Date(
    moment.getFullYear(),
    moment.getMonth(),
    moment.getDate(),
    23,
    59,
    59
  );

  return Math.ceil((finDuJour.valueOf() - moment.valueOf()) / 1_000);
};

export {
  ajouteMoisADate,
  dateEnFrancais,
  dateEnIso,
  chaineDateFrEnChaineDateISO,
  dateInvalide,
  dateYYYYMMDD,
  secondesJusqua23h59m59s,
};

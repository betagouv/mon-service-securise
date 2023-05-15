const ajouteMoisADate = (nbMois, chaineDate) => {
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

const dateEnFrancais = (chaineDate) => {
  const date = new Date(chaineDate);
  return date.toLocaleString('fr-FR', { dateStyle: 'short' });
};

// On utilise le standard canadien pour obtenir le format YYYY-MM-DD
const dateYYYYMMDD = (date) =>
  Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replaceAll('-', '');

const dateInvalide = (chaineDate) =>
  Number.isNaN(new Date(chaineDate).valueOf());

module.exports = {
  ajouteMoisADate,
  dateEnFrancais,
  dateInvalide,
  dateYYYYMMDD,
};

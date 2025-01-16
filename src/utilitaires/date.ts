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

const dateEnIso = (chaineDate) => {
  const date = new Date(chaineDate);
  // On utilise le standard canadien pour obtenir le format YYYY-MM-DD
  return date.toLocaleString('fr-CA', { dateStyle: 'short' });
};

const dateYYYYMMDD = (date) => dateEnIso(date).replaceAll('-', '');

const dateInvalide = (chaineDate) =>
  Number.isNaN(new Date(chaineDate).valueOf());

module.exports = {
  ajouteMoisADate,
  dateEnFrancais,
  dateEnIso,
  dateInvalide,
  dateYYYYMMDD,
};

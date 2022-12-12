const ajouteMoisADate = (nbMois, chaineDate) => {
  const date = new Date(chaineDate);
  const jour = date.getDate();

  const depassementJourMoisSuivant = () => (date.getDate() !== jour);
  const reviensFinMoisPrecedent = () => (date.setDate(0));

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

const dateInvalide = (chaineDate) => Number.isNaN(new Date(chaineDate).valueOf());

module.exports = { ajouteMoisADate, dateEnFrancais, dateInvalide };

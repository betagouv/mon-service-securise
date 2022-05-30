const construis = (clef, donnees) => Object.keys(donnees)
  .filter((date) => donnees[date][clef])
  .map((date) => ({ x: date, y: donnees[date][clef] }));

export default construis;

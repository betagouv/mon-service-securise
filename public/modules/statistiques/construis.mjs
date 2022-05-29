const construis = (clef, donnees) => Object.keys(donnees)
  .map((date) => ({ x: date, y: donnees[date][clef] }));

export default construis;

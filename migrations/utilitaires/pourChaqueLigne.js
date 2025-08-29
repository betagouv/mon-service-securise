import pMap from 'p-map';

const pourChaqueLigne = (requete, miseAJour) =>
  requete.then((lignes) => pMap(lignes, miseAJour, { concurrency: 2 }));

export default pourChaqueLigne;

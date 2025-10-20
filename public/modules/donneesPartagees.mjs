import { decode } from '../bibliotheques/html-entities-2.6.0.min.js';

const lisDonneesPartagees = (id) => {
  const donneesEncodees = JSON.parse(document.getElementById(id).textContent);
  const decodees = JSON.stringify(donneesEncodees, (_cle, valeur) =>
    typeof valeur === 'string' ? decode(valeur) : valeur
  );
  return JSON.parse(decodees);
};

export default lisDonneesPartagees;

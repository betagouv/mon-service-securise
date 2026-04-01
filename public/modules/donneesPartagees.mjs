import { decode } from '../bibliotheques/html-entities-2.6.0.min.js';

const lisDonneesPartagees = (id) => {
  const element = document.getElementById(id);
  if (!element) return {};
  const donneesEncodees = JSON.parse(element.textContent);
  const decodees = JSON.stringify(donneesEncodees, (_cle, valeur) =>
    typeof valeur === 'string' ? decode(valeur) : valeur
  );
  return JSON.parse(decodees);
};

export default lisDonneesPartagees;

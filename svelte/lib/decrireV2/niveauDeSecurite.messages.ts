import type { IdNiveauDeSecurite } from '../ui/types.js';
import donneesNiveauxDeSecurite from '../niveauxDeSecurite/donneesNiveauxDeSecurite.js';

export const nomNiveauDeSecurite = (niveau: IdNiveauDeSecurite) =>
  donneesNiveauxDeSecurite.find((d) => d.id === niveau)!.nom;

export const avertissementChangementObligatoire = (
  niveauActuel: IdNiveauDeSecurite,
  niveauRequis: IdNiveauDeSecurite
) => {
  const actuel = nomNiveauDeSecurite(niveauActuel);
  const requis = nomNiveauDeSecurite(niveauRequis);
  return (
    'Les modifications apportées aux caractéristiques du service entraînent une évolution du niveau de sécurité requis. ' +
    `Votre service passera ainsi des besoins <b>${actuel}</b> ` +
    `aux besoins <b>${requis}</b>. Pour valider ces changements, veuillez confirmer ce nouveau niveau de sécurité.`
  );
};

export const miseAJourForceeReussie = (
  ancienNiveau: IdNiveauDeSecurite,
  nouveauNiveau: IdNiveauDeSecurite
) => {
  const nouveau = nomNiveauDeSecurite(nouveauNiveau);
  const ancien = nomNiveauDeSecurite(ancienNiveau);
  return (
    'Les informations et les besoins de sécurité de votre service ont été mis à jour avec succès.<br/>' +
    `Les besoins de sécurité sont passés de <b>${ancien}</b> à <b>${nouveau}.</b>`
  );
};

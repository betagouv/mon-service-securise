import {
  modifieParametresAvecItemsExtraits,
  modifieParametresGroupementElements,
} from './parametres.mjs';

const PARTIES_PRENANTES_FIXES = [
  'developpementFourniture',
  'hebergement',
  'maintenanceService',
  'securiteService',
];

const integrePartiesPrenantesSpecifiques = (parametres) => {
  modifieParametresAvecItemsExtraits(
    parametres,
    'partiesPrenantesSpecifiques',
    '^(nom|natureAcces|pointContact)-partie-prenante-specifique-'
  );

  parametres.partiesPrenantes = parametres.partiesPrenantes || [];
  parametres.partiesPrenantesSpecifiques
    .map((partiePrenanteSpecifique) => ({
      type: 'PartiePrenanteSpecifique',
      ...partiePrenanteSpecifique,
    }))
    .forEach((partiePrenanteSpecifique) => {
      parametres.partiesPrenantes.push(partiePrenanteSpecifique);
    });
  delete parametres.partiesPrenantesSpecifiques;
};

export default (parametres) => {
  modifieParametresAvecItemsExtraits(
    parametres,
    'acteursHomologation',
    '^(role|nom|fonction)-acteur-homologation-'
  );

  integrePartiesPrenantesSpecifiques(parametres);

  PARTIES_PRENANTES_FIXES.forEach((identifiant) =>
    modifieParametresGroupementElements(
      parametres,
      'partiesPrenantes',
      identifiant
    )
  );
};

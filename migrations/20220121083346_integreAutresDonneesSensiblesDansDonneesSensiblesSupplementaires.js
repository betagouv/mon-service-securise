const DESCRIPTION_PAR_DEFAUT_AUTRES_DONNEES_SENSIBLES =
  'Autres données sensibles';
const IDENTIFIANT_AUTRES_DONNEES_SENSIBLES = 'autre';

const deplace = (filtreAutresDonneesSensibles, fonctionMiseAJour) => (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(filtreAutresDonneesSensibles)
      .map(({ id, donnees }) => {
        donnees.descriptionService = fonctionMiseAJour(
          donnees.descriptionService
        );
        donnees.informationsGenerales = fonctionMiseAJour(
          donnees.informationsGenerales
        );
        return knex('homologations').where({ id }).update({ donnees });
      });

    return Promise.all(misesAJour);
  });

const autresDonneesSensiblesGeneriques = ({ donnees }) =>
  donnees.descriptionService?.donneesCaracterePersonnel?.indexOf?.(
    IDENTIFIANT_AUTRES_DONNEES_SENSIBLES
  ) > -1;

const versDonneesSensiblesSpecifiques = (descriptionService) => {
  descriptionService.donneesSensiblesSpecifiques ||= [];
  descriptionService.donneesSensiblesSpecifiques.push({
    description: DESCRIPTION_PAR_DEFAUT_AUTRES_DONNEES_SENSIBLES,
  });

  descriptionService.donneesCaracterePersonnel =
    descriptionService.donneesCaracterePersonnel.filter(
      (f) => f !== IDENTIFIANT_AUTRES_DONNEES_SENSIBLES
    );

  return descriptionService;
};

const autresDonneesSensiblesSpecifiques = ({ donnees }) =>
  donnees.descriptionService?.donneesSensiblesSpecifiques?.some?.(
    (f) => f.description === DESCRIPTION_PAR_DEFAUT_AUTRES_DONNEES_SENSIBLES
  );

const versDonneesSensiblesGeneriques = (descriptionService) => {
  descriptionService.donneesCaracterePersonnel ||= [];
  descriptionService.donneesCaracterePersonnel.push(
    IDENTIFIANT_AUTRES_DONNEES_SENSIBLES
  );

  descriptionService.donneesSensiblesSpecifiques =
    descriptionService.donneesSensiblesSpecifiques.filter(
      (f) => f?.description !== DESCRIPTION_PAR_DEFAUT_AUTRES_DONNEES_SENSIBLES
    );

  return descriptionService;
};

exports.up = deplace(
  autresDonneesSensiblesGeneriques,
  versDonneesSensiblesSpecifiques
);

exports.down = deplace(
  autresDonneesSensiblesSpecifiques,
  versDonneesSensiblesGeneriques
);

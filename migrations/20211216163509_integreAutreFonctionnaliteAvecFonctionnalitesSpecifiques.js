const DESCRIPTION_PAR_DEFAUT_AUTRES_FONCTIONNALITES = 'Autres fonctionnalités permettant des échanges de données';
const IDENTIFIANT_AUTRE_FONCTIONNALITE = 'autre';

const deplace = (filtreAutresFonctionnalites, fonctionMiseAJour) => (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(filtreAutresFonctionnalites)
      .map(({ id, donnees }) => {
        donnees.informationsGenerales = fonctionMiseAJour(donnees.informationsGenerales);
        return knex('homologations')
          .where({ id })
          .update({ donnees });
      });

    return Promise.all(misesAJour);
  });

const autresFonctionnalitesGeneriques = ({ donnees }) => (
  donnees.informationsGenerales
  && Array.isArray(donnees.informationsGenerales.fonctionnalites)
  && donnees.informationsGenerales.fonctionnalites.indexOf(IDENTIFIANT_AUTRE_FONCTIONNALITE) !== -1
);

const versFonctionnalitesSpecifiques = (informationsGenerales) => {
  informationsGenerales.fonctionnalitesSpecifiques ||= [];
  informationsGenerales.fonctionnalitesSpecifiques.push(
    { description: DESCRIPTION_PAR_DEFAUT_AUTRES_FONCTIONNALITES }
  );

  informationsGenerales.fonctionnalites = informationsGenerales.fonctionnalites
    .filter((f) => f !== IDENTIFIANT_AUTRE_FONCTIONNALITE);

  return informationsGenerales;
};

const autresFonctionnalitesSpecifiques = ({ donnees }) => (
  donnees.informationsGenerales
  && Array.isArray(donnees.informationsGenerales.fonctionnalitesSpecifiques)
  && donnees.informationsGenerales.fonctionnalitesSpecifiques
    .some((f) => f.description === DESCRIPTION_PAR_DEFAUT_AUTRES_FONCTIONNALITES)
);

const versFonctionnalitesGeneriques = (informationsGenerales) => {
  informationsGenerales.fonctionnalites ||= [];
  informationsGenerales.fonctionnalites.push(IDENTIFIANT_AUTRE_FONCTIONNALITE);

  informationsGenerales.fonctionnalitesSpecifiques = informationsGenerales
    .fonctionnalitesSpecifiques
    .filter((f) => f?.description !== DESCRIPTION_PAR_DEFAUT_AUTRES_FONCTIONNALITES);

  return informationsGenerales;
};

exports.up = deplace(autresFonctionnalitesGeneriques, versFonctionnalitesSpecifiques);

exports.down = deplace(autresFonctionnalitesSpecifiques, versFonctionnalitesGeneriques);

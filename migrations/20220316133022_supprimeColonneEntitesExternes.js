const miseAJour = (contientDonneesCiblees, actionMiseAJour) => (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(contientDonneesCiblees)
      .map(({ id, donnees }) => {
        const donneesModifiees = actionMiseAJour(donnees);
        return knex('homologations')
          .where({ id })
          .update({ donnees: donneesModifiees });
      });
    return Promise.all(misesAJour);
  });

const contientCaracteristiquesComplementaires = ({ donnees }) =>
  donnees?.caracteristiquesComplementaires;

const supprimeEntitesExternes = (donnees) => {
  delete donnees.caracteristiquesComplementaires.entitesExternes;

  return donnees;
};

const contientRolesResponsabilites = ({ donnees }) =>
  donnees?.rolesResponsabilites;

const copieEntitesExternes = (donnees) => {
  donnees.caracteristiquesComplementaires ||= {};
  donnees.caracteristiquesComplementaires.entitesExternes =
    donnees.rolesResponsabilites?.partiesPrenantes
      ?.filter(
        (partiePrenante) => partiePrenante.type === 'PartiePrenanteSpecifique'
      )
      ?.map((partiePrenanteSpecifique) => ({
        nom: partiePrenanteSpecifique.nom,
        acces: partiePrenanteSpecifique.natureAcces,
        contact: partiePrenanteSpecifique.pointContact,
      }));

  return donnees;
};

exports.up = miseAJour(
  contientCaracteristiquesComplementaires,
  supprimeEntitesExternes
);

exports.down = miseAJour(contientRolesResponsabilites, copieEntitesExternes);

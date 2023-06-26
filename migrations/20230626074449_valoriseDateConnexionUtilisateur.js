// On cherche ici à 'rattraper' tous les utilisateurs qui se sont connectés sur MSS
// (donc ils n'ont pas de valeur dans le champ 'idResetMotDePasse')
// On utilise leur date_creation 'utilisateur' pour créer un ParcoursUtilisateur
// avec cette valeur comme 'dateDerniereConnexion'

// Ceci nous permet de savoir filtrer quels utilisateurs ont vraiment activé leur compte
// pour afficher ces derniers dans le tiroir contributeurs

exports.up = async (knex) => {
  const utilisateursSansParcours = await knex.raw(
    'SELECT u.id, u.date_creation, u.donnees from utilisateurs as u where NOT EXISTS (SELECT p.id from parcours_utilisateurs as p where p.id = u.id)'
  );

  const promessesUtilisateursJamaisConnecte = utilisateursSansParcours.rows
    .filter(({ donnees }) => donnees.idResetMotDePasse === undefined)
    .map(({ id, date_creation }) =>
      knex('parcours_utilisateurs').insert({
        id,
        donnees: { idUtilisateur: id, dateDerniereConnexion: date_creation },
      })
    );
  return Promise.all(promessesUtilisateursJamaisConnecte);
};

exports.down = async () => {};

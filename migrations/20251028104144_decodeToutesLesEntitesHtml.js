import { decode } from 'html-entities';
import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

export const up = async (knex) => {
  const chiffrement = fabriqueAdaptateurChiffrement();

  const enleveEntitesHTML = (dechiffrees) =>
    JSON.stringify(dechiffrees, (_cle, valeur) =>
      typeof valeur === 'string' ? decode(valeur) : valeur
    );

  const dechiffreEtEnleveEntitesHTML = async (donnees) => {
    const dechiffrees = await chiffrement.dechiffre(donnees);
    const sansEntitesHTML = enleveEntitesHTML(dechiffrees);
    return JSON.parse(sansEntitesHTML);
  };

  const nettoieLesServices = async (trx) => {
    const services = await trx('services');

    const nettoyage = services.map(async ({ id, donnees }) => {
      const objetClean = await dechiffreEtEnleveEntitesHTML(donnees);
      const chiffrees = await chiffrement.chiffre(objetClean);

      const { nomService } = objetClean.descriptionService;
      const nouveauHash = chiffrement.hacheSha256(nomService);

      await trx('services')
        .where({ id })
        .update({ donnees: chiffrees, nom_service_hash: nouveauHash });
    });

    await Promise.all(nettoyage);
  };

  const nettoieLesUtilisateurs = async (trx) => {
    const utilisateurs = await trx('utilisateurs');

    const nettoyage = utilisateurs.map(async ({ id, donnees }) => {
      const objetClean = await dechiffreEtEnleveEntitesHTML(donnees);
      const chiffrees = await chiffrement.chiffre(objetClean);

      const { email } = objetClean;
      const nouveauHash = chiffrement.hacheSha256(email);

      await trx('utilisateurs')
        .where({ id })
        .update({ donnees: chiffrees, email_hash: nouveauHash });
    });

    await Promise.all(nettoyage);
  };

  const nettoieLesAjoutsDeCommentaires = async (trx) => {
    const ajoutsDeCommentaire = await trx('activites_mesure').where({
      type: 'ajoutCommentaire',
    });

    const nettoieLesAjouts = ajoutsDeCommentaire.map(
      async ({ id, details }) => {
        const detailsClean = JSON.parse(enleveEntitesHTML(details));
        await trx('activites_mesure')
          .where({ id })
          .update({ details: detailsClean });
      }
    );

    await Promise.all(nettoieLesAjouts);
  };

  const nettoieLesModelesDeMesureSpecifique = async (trx) => {
    const modeles = await trx('modeles_mesure_specifique');

    const nettoyage = modeles.map(async ({ id, donnees }) => {
      const objetClean = await dechiffreEtEnleveEntitesHTML(donnees);
      const chiffrees = await chiffrement.chiffre(objetClean);
      await trx('modeles_mesure_specifique')
        .where({ id })
        .update({ donnees: chiffrees });
    });

    await Promise.all(nettoyage);
  };

  await knex.transaction(async (trx) => {
    await nettoieLesServices(trx);
    await nettoieLesUtilisateurs(trx);
    await nettoieLesAjoutsDeCommentaires(trx);
    await nettoieLesModelesDeMesureSpecifique(trx);
  });
};

export const down = async () => {
  // Vide. On ne sait pas précisément quels sont les champs à réencoder.
};

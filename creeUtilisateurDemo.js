import fabriqueAdaptateurPersistance from './src/adaptateurs/fabriqueAdaptateurPersistance.js';
import { creeDepot } from './src/depotDonnees.js';
import DescriptionService from './src/modeles/descriptionService.js';
import { creeReferentiel } from './src/referentiel.js';
import BusEvenements from './src/bus/busEvenements.js';
import { fabriqueAdaptateurGestionErreur } from './src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { fabriqueAdaptateurChiffrement } from './src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import * as adaptateurRechercheEntite from './src/adaptateurs/adaptateurRechercheEntrepriseAPI.js';
import { fabriqueAdaptateurUUID } from './src/adaptateurs/adaptateurUUID.js';

const referentiel = creeReferentiel();

const descriptionService = new DescriptionService(
  {
    delaiAvantImpactCritique: 'plusUneJournee',
    localisationDonnees: 'france',
    nomService: 'Dossier de test',
    presentation:
      "Le service créé par MonServiceSécurisé comme donnée d'exemple sur ses environnements de DÉMO.",
    provenanceService: 'developpement',
    statutDeploiement: 'enLigne',
    typeService: ['siteInternet'],
    organisationResponsable: {
      siret: process.env.SIRET_ENTITE_UTILISATEUR_DEMO,
      nom: process.env.NOM_ENTITE_UTILISATEUR_DEMO,
      departement: process.env.DEPARTEMENT_ENTITE_UTILISATEUR_DEMO,
    },
    nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
    niveauSecurite: 'niveau1',
  },
  referentiel
);

const creeDonnees = async (depotDonnees, persistance) => {
  const u = await depotDonnees.nouvelUtilisateur({
    prenom: process.env.PRENOM_UTILISATEUR_DEMO,
    nom: process.env.NOM_UTILISATEUR_DEMO,
    email: process.env.EMAIL_UTILISATEUR_DEMO,
    entite: {
      siret: process.env.SIRET_ENTITE_UTILISATEUR_DEMO,
      nom: process.env.NOM_ENTITE_UTILISATEUR_DEMO,
      departement: process.env.DEPARTEMENT_ENTITE_UTILISATEUR_DEMO,
    },
    estimationNombreServices: { borneBasse: '1', borneHaute: '10' },
    cguAcceptees: true,
  });

  await depotDonnees.metsAJourMotDePasse(
    u.id,
    process.env.MOT_DE_PASSE_UTILISATEUR_DEMO
  );

  const idService = await depotDonnees.nouveauService(u.id, {
    descriptionService: descriptionService.toJSON(),
  });

  const tacheService = {
    id: fabriqueAdaptateurUUID().genereUUID(),
    idService,
    nature: 'niveauSecuriteRetrograde',
    donnees: { nouveauxBesoins: 'élémentaires' },
  };

  await persistance.ajouteTacheDeService(tacheService);

  const suggestionAction = {
    idService,
    nature: 'controleBesoinsDeSecuriteRetrogrades',
  };
  await persistance.ajouteSuggestionAction(suggestionAction);
};

const main = async () => {
  if (process.env.CREATION_UTILISATEUR_DEMO) {
    const adaptateurPersistance = fabriqueAdaptateurPersistance(
      process.env.NODE_ENV
    );
    const busEvenements = new BusEvenements({
      adaptateurGestionErreur: fabriqueAdaptateurGestionErreur(),
    });
    const adaptateurChiffrement = fabriqueAdaptateurChiffrement();
    const depotDonnees = creeDepot({
      adaptateurPersistance,
      adaptateurRechercheEntite,
      adaptateurChiffrement,
      busEvenements,
    });

    /* eslint-disable no-console */
    const u = await depotDonnees.utilisateurAvecEmail(
      process.env.EMAIL_UTILISATEUR_DEMO
    );

    if (u) {
      console.log('Utilisateur déjà existant !…');
      process.exit(0);
    }

    await creeDonnees(depotDonnees, adaptateurPersistance);
    console.log('Utilisateur de démonstration créé !');
    process.exit(0);
    /* eslint-enable no-console */
  }
};

main().then(() => {});

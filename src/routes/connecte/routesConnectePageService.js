import express from 'express';
import { decode } from 'html-entities';
import InformationsService from '../../modeles/informationsService.js';
import {
  Permissions,
  premiereRouteDisponible,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import Service from '../../modeles/service.js';
import { dateYYYYMMDD } from '../../utilitaires/date.js';
import RisqueGeneral from '../../modeles/risqueGeneral.js';

const { LECTURE } = Permissions;
const { CONTACTS, SECURISER, RISQUES, HOMOLOGUER, DECRIRE } = Rubriques;

const routesConnectePageService = ({
  middleware,
  referentiel,
  depotDonnees,
  moteurRegles,
  adaptateurCsv,
  adaptateurGestionErreur,
  adaptateurHorloge,
}) => {
  const routes = express.Router();
  const departements = referentiel.departements();

  routes.get(
    '/creation',
    middleware.chargePreferencesUtilisateur,
    (requete, reponse, suite) => {
      const { idUtilisateurCourant } = requete;
      depotDonnees
        .utilisateur(idUtilisateurCourant)
        .then((utilisateur) => {
          reponse.render('service/creation', {
            InformationsService,
            referentiel,
            service: Service.creePourUnUtilisateur(utilisateur),
            etapeActive: 'descriptionService',
            departements,
          });
        })
        .catch(suite);
    }
  );

  routes.get(
    '/:id',
    middleware.aseptise('id'),
    middleware.trouveService({}),
    middleware.chargeAutorisationsService,
    async (requete, reponse) => {
      const { autorisationService } = requete;

      const routesDesSuggestions =
        requete.service.routesDesSuggestionsActions();

      const routeRedirection = premiereRouteDisponible(
        autorisationService,
        routesDesSuggestions
      );

      if (!routeRedirection) {
        reponse.redirect('/tableauDeBord');
        return;
      }

      reponse.redirect(`/service/${requete.params.id}${routeRedirection}`);
    }
  );

  routes.get(
    '/:id/descriptionService',
    middleware.trouveService({ [DECRIRE]: LECTURE }),
    middleware.chargeAutorisationsService,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse) => {
      const { service } = requete;

      const estLectureSeule =
        reponse.locals.autorisationsService?.DECRIRE?.estLectureSeule;

      reponse.render('service/descriptionService', {
        InformationsService,
        referentiel,
        service,
        etapeActive: 'descriptionService',
        departements,
        ...(estLectureSeule && {
          niveauRecommandeLectureSeule: service.estimeNiveauDeSecurite(),
        }),
      });
    }
  );

  routes.get(
    '/:id/mesures',
    middleware.trouveService({ [SECURISER]: LECTURE }),
    middleware.chargeAutorisationsService,
    middleware.chargePreferencesUtilisateur,
    async (requete, reponse) => {
      const { service } = requete;

      const mesures = moteurRegles.mesures(service.descriptionService);

      reponse.render('service/mesures', {
        InformationsService,
        referentiel,
        service,
        etapeActive: 'mesures',
        mesures,
      });
    }
  );

  routes.get(
    '/:id/mesures/export.csv',
    middleware.aseptise('id', 'avecDonneesAdditionnelles'),
    middleware.trouveService({ [SECURISER]: LECTURE }),
    async (requete, reponse) => {
      const { service } = requete;
      const { avecDonneesAdditionnelles } = requete.query;

      try {
        const contributeurs = Object.fromEntries(
          service.contributeurs.map((c) => [c.idUtilisateur, c.prenomNom()])
        );
        const bufferCsv = await adaptateurCsv.genereCsvMesures(
          service.mesures.enrichiesAvecDonneesPersonnalisees(),
          contributeurs,
          avecDonneesAdditionnelles,
          referentiel
        );

        const s = decode(service.nomService())
          .substring(0, 30)
          .replace(/[^a-zA-Z ]/g, '');
        const date = dateYYYYMMDD(adaptateurHorloge.maintenant());
        const perimetre = avecDonneesAdditionnelles ? 'avec' : 'sans';
        const fichier = `${s} Liste mesures ${perimetre} données additionnelles ${date}.csv`;
        const uriFichier = encodeURIComponent(fichier);

        reponse
          .contentType('text/csv;charset=utf-8')
          .set(
            'Content-Disposition',
            `attachment; filename="${fichier}"; filename*=UTF-8''${uriFichier}`
          )
          .send(bufferCsv);
      } catch (e) {
        adaptateurGestionErreur.logueErreur(e);
        reponse.sendStatus(424);
      }
    }
  );

  routes.get(
    '/:id/indiceCyber',
    middleware.trouveService(Autorisation.DROITS_VOIR_INDICE_CYBER),
    middleware.chargeAutorisationsService,
    middleware.chargePreferencesUtilisateur,
    async (requete, reponse) => {
      const { service } = requete;
      const referentiels = Object.entries(
        service.mesures.enrichiesAvecDonneesPersonnalisees().mesuresGenerales
      ).map(([_, mesure]) => mesure.referentiel);
      const referentielConcernes =
        referentiel.formatteListeDeReferentiels(referentiels);
      reponse.render('service/indiceCyber', {
        InformationsService,
        service,
        etapeActive: 'mesures',
        referentiel,
        referentielConcernes,
      });
    }
  );

  routes.get(
    '/:id/rolesResponsabilites',
    middleware.trouveService({ [CONTACTS]: LECTURE }),
    middleware.chargeAutorisationsService,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse) => {
      const { service } = requete;
      reponse.render('service/rolesResponsabilites', {
        InformationsService,
        service,
        etapeActive: 'contactsUtiles',
        referentiel,
      });
    }
  );

  routes.get(
    '/:id/risques',
    middleware.trouveService({ [RISQUES]: LECTURE }),
    middleware.chargeAutorisationsService,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse) => {
      const { service } = requete;
      const { risquesGeneraux, risquesSpecifiques } = service.risques.toJSON();
      const risquesGenerauxAConsiderer = Object.keys(referentiel.risques())
        .map((id) => risquesGeneraux.find((r) => r.id === id) || { id })
        .map((donnees) => new RisqueGeneral(donnees, referentiel).toJSON());
      reponse.render('service/risques', {
        InformationsService,
        referentiel,
        service,
        donneesRisques: {
          risquesGeneraux: risquesGenerauxAConsiderer,
          risquesSpecifiques,
        },
        etapeActive: 'risques',
      });
    }
  );

  routes.get(
    '/:id/dossiers',
    middleware.trouveService({ [HOMOLOGUER]: LECTURE }),
    middleware.chargeAutorisationsService,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse) => {
      const { service, autorisationService } = requete;

      const peutVoirTamponHomologation =
        autorisationService.aLesPermissions(
          Autorisation.DROIT_TAMPON_HOMOLOGATION_ZIP
        ) && service.dossiers.aUnDossierEnCoursDeValidite();

      reponse.render('service/dossiers', {
        InformationsService,
        decode,
        service,
        etapeActive: 'dossiers',
        premiereEtapeParcours: referentiel.premiereEtapeParcours(),
        peutVoirTamponHomologation,
        referentiel,
      });
    }
  );

  routes.get(
    '/:id/homologation/edition/etape/:idEtape',
    middleware.trouveService({ [HOMOLOGUER]: LECTURE }),
    middleware.chargeAutorisationsService,
    middleware.chargePreferencesUtilisateur,
    async (requete, reponse, suite) => {
      const { service, autorisationService } = requete;
      const { idEtape } = requete.params;

      if (!referentiel.etapeExiste(idEtape)) {
        reponse.status(404).send('Étape inconnue');
        return;
      }

      try {
        await depotDonnees.ajouteDossierCourantSiNecessaire(service.id);

        const s = await depotDonnees.service(service.id);
        const etapeCourante = referentiel.etapeDossierAutorisee(
          s.dossierCourant().etapeCourante(),
          autorisationService.peutHomologuer()
        );
        const numeroEtapeCourante = referentiel.numeroEtape(etapeCourante);
        const numeroEtapeDemandee = referentiel.numeroEtape(idEtape);
        if (numeroEtapeDemandee > numeroEtapeCourante) {
          reponse.redirect(etapeCourante);
          return;
        }

        reponse.render(`service/etapeDossier/${idEtape}`, {
          InformationsService,
          referentiel,
          service: s,
          etapeActive: 'dossiers',
          idEtape,
        });
      } catch (e) {
        suite();
      }
    }
  );

  routes.get('/v2/creation', async (requete, reponse) => {
    const utilisateur = await depotDonnees.utilisateur(
      requete.idUtilisateurCourant
    );
    const entite = utilisateur.entite.siret ? utilisateur.entite : undefined;
    reponse.render('service/creation-v2', { entite });
  });

  return routes;
};

export default routesConnectePageService;

const express = require('express');

const InformationsHomologation = require('../../modeles/informationsHomologation');

const {
  Permissions,
  Rubriques,
  premiereRouteDisponible,
} = require('../../modeles/autorisations/gestionDroits');
const Autorisation = require('../../modeles/autorisations/autorisation');
const Service = require('../../modeles/service');

const { LECTURE } = Permissions;
const { CONTACTS, SECURISER, RISQUES, HOMOLOGUER, DECRIRE } = Rubriques;

const routesService = ({
  middleware,
  referentiel,
  depotDonnees,
  moteurRegles,
  adaptateurCsv,
  adaptateurGestionErreur,
}) => {
  const routes = express.Router();

  routes.get(
    '/creation',
    middleware.verificationAcceptationCGU,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse, suite) => {
      const { idUtilisateurCourant } = requete;
      depotDonnees
        .utilisateur(idUtilisateurCourant)
        .then((utilisateur) => {
          reponse.render('service/creation', {
            InformationsHomologation,
            referentiel,
            service: Service.creePourUnUtilisateur(utilisateur),
            etapeActive: 'descriptionService',
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
      const routeRedirection = premiereRouteDisponible(autorisationService);
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
      const { homologation } = requete;
      reponse.render('service/descriptionService', {
        InformationsHomologation,
        referentiel,
        service: homologation,
        etapeActive: 'descriptionService',
      });
    }
  );

  routes.get(
    '/:id/mesures',
    middleware.trouveService({ [SECURISER]: LECTURE }),
    middleware.chargeAutorisationsService,
    middleware.chargePreferencesUtilisateur,
    middleware.chargeFeatureFlags,
    async (requete, reponse) => {
      const { homologation } = requete;

      const mesures = moteurRegles.mesures(homologation.descriptionService);
      const completude = homologation.completudeMesures();
      const pourcentageProgression = Math.round(
        (completude.nombreMesuresCompletes / completude.nombreTotalMesures) *
          100
      );

      reponse.render('service/mesures', {
        InformationsHomologation,
        referentiel,
        service: homologation,
        etapeActive: 'mesures',
        pourcentageProgression,
        mesures,
      });
    }
  );

  routes.get(
    '/:id/mesures/export.csv',
    middleware.aseptise('id', 'avecDonneesAdditionnelles'),
    middleware.trouveService({ [SECURISER]: LECTURE }),
    async (requete, reponse) => {
      const { homologation: service } = requete;

      try {
        const bufferCsv = await adaptateurCsv.genereCsvMesures(
          service.mesures.enrichiesAvecDonneesPersonnalisees(),
          requete.query.avecDonneesAdditionnelles
        );

        reponse
          .contentType('text/csv;charset=utf-8')
          .set('Content-Disposition', `attachment; filename="mesures.csv"`)
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
      const { homologation: service } = requete;
      const referentiels = Object.entries(
        service.mesures.enrichiesAvecDonneesPersonnalisees().mesuresGenerales
      ).map(([_, mesure]) => mesure.referentiel);
      const referentielConcernes =
        referentiel.formatteListeDeReferentiels(referentiels);
      reponse.render('service/indiceCyber', {
        InformationsHomologation,
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
      const { homologation } = requete;
      reponse.render('service/rolesResponsabilites', {
        InformationsHomologation,
        service: homologation,
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
      const { homologation } = requete;
      reponse.render('service/risques', {
        InformationsHomologation,
        referentiel,
        service: homologation,
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
      const { homologation } = requete;
      reponse.render('service/dossiers', {
        InformationsHomologation,
        service: homologation,
        etapeActive: 'dossiers',
        premiereEtapeParcours: referentiel.premiereEtapeParcours(),
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
      const { homologation } = requete;
      const { idEtape } = requete.params;

      if (!referentiel.etapeExiste(idEtape)) {
        reponse.status(404).send('Étape inconnue');
        return;
      }

      try {
        await depotDonnees.ajouteDossierCourantSiNecessaire(homologation.id);

        const h = await depotDonnees.homologation(homologation.id);
        const etapeCourante = h.dossierCourant().etapeCourante();
        const numeroEtapeCourante = referentiel.numeroEtape(etapeCourante);
        const numeroEtapeDemandee = referentiel.numeroEtape(idEtape);
        if (numeroEtapeDemandee > numeroEtapeCourante) {
          reponse.redirect(etapeCourante);
          return;
        }

        reponse.render(`service/etapeDossier/${idEtape}`, {
          InformationsHomologation,
          referentiel,
          service: h,
          etapeActive: 'dossiers',
          idEtape,
        });
      } catch (e) {
        suite();
      }
    }
  );

  return routes;
};

module.exports = routesService;

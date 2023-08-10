const express = require('express');

const ActionsSaisie = require('../../modeles/actionsSaisie');
const Homologation = require('../../modeles/homologation');
const InformationsHomologation = require('../../modeles/informationsHomologation');
const ObjetApiStatutHomologation = require('../../modeles/objetsApi/objetApiStatutHomologation');
const ActionSaisie = require('../../modeles/actionSaisie');

const routesService = (middleware, referentiel, depotDonnees, moteurRegles) => {
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
          const donneesService = {};
          if (utilisateur.nomEntitePublique) {
            donneesService.descriptionService = {
              organisationsResponsables: [utilisateur.nomEntitePublique],
            };
          }

          const service = new Homologation(donneesService);
          const actionCreation = new ActionSaisie(
            referentiel.premiereActionSaisie(),
            referentiel,
            service
          );
          reponse.render('service/creation', {
            InformationsHomologation,
            referentiel,
            service,
            actionsSaisie: [actionCreation.toJSON()],
            etapeActive: 'descriptionService',
          });
        })
        .catch(suite);
    }
  );

  routes.get('/:id', middleware.trouveService, (requete, reponse) => {
    reponse.redirect(`/service/${requete.params.id}/descriptionService`);
  });

  routes.get(
    '/:id/descriptionService',
    middleware.trouveService,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('service/descriptionService', {
        InformationsHomologation,
        referentiel,
        service: homologation,
        actionsSaisie: new ActionsSaisie(referentiel, homologation).toJSON(),
        etapeActive: 'descriptionService',
      });
    }
  );

  routes.get(
    '/:id/mesures',
    middleware.trouveService,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse) => {
      const { homologation } = requete;
      const mesures = moteurRegles.mesures(homologation.descriptionService);
      reponse.render('service/mesures', {
        InformationsHomologation,
        referentiel,
        service: homologation,
        actionsSaisie: new ActionsSaisie(referentiel, homologation).toJSON(),
        etapeActive: 'mesures',
        mesures,
        donneesStatutHomologation: new ObjetApiStatutHomologation(
          homologation,
          referentiel
        ).donnees(),
      });
    }
  );

  routes.get(
    '/:id/rolesResponsabilites',
    middleware.trouveService,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('service/rolesResponsabilites', {
        InformationsHomologation,
        service: homologation,
        actionsSaisie: new ActionsSaisie(referentiel, homologation).toJSON(),
        etapeActive: 'contactsUtiles',
        referentiel,
      });
    }
  );

  routes.get(
    '/:id/risques',
    middleware.trouveService,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('service/risques', {
        InformationsHomologation,
        referentiel,
        service: homologation,
        actionsSaisie: new ActionsSaisie(referentiel, homologation).toJSON(),
        etapeActive: 'risques',
      });
    }
  );

  routes.get(
    '/:id/dossiers',
    middleware.trouveService,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('service/dossiers', {
        InformationsHomologation,
        service: homologation,
        actionsSaisie: new ActionsSaisie(referentiel, homologation).toJSON(),
        etapeActive: 'dossiers',
        premiereEtapeParcours: referentiel.premiereEtapeParcours(),
        referentiel,
      });
    }
  );

  routes.get(
    '/:id/homologation/edition/etape/:idEtape',
    middleware.trouveService,
    middleware.chargePreferencesUtilisateur,
    (requete, reponse, suite) => {
      const { homologation } = requete;
      const { idEtape } = requete.params;

      if (!referentiel.etapeExiste(idEtape)) {
        reponse.status(404).send('Étape inconnue');
        return;
      }

      depotDonnees
        .ajouteDossierCourantSiNecessaire(homologation.id)
        .then(() => depotDonnees.homologation(homologation.id))
        .then((h) => {
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
            actionsSaisie: new ActionsSaisie(referentiel, h).toJSON(),
            etapeActive: 'dossiers',
            idEtape,
          });
        })
        .catch(suite);
    }
  );

  return routes;
};

module.exports = routesService;

import { ajoutContributeurSurServices } from '../modeles/autorisations/ajoutContributeurSurServices.js';

const fabriqueProcedures = ({
  depotDonnees,
  adaptateurMail,
  adaptateurTracking,
  busEvenements,
}) => ({
  ajoutContributeurSurServices: async (
    emailContributeur,
    service,
    droits,
    emetteur
  ) =>
    ajoutContributeurSurServices({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
      busEvenements,
    }).executer(emailContributeur, service, droits, emetteur),
});

export { fabriqueProcedures };

const {
  ajoutContributeurSurServices,
} = require('../modeles/autorisations/ajoutContributeurSurServices');

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

module.exports = { fabriqueProcedures };

const {
  ajoutContributeurSurServices,
} = require('../modeles/autorisations/ajoutContributeurSurServices');

const fabriqueProcedures = ({
  depotDonnees,
  adaptateurMail,
  adaptateurTracking,
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
    }).executer(emailContributeur, service, droits, emetteur),
});

module.exports = { fabriqueProcedures };

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
    emetteur
  ) => {
    await ajoutContributeurSurServices({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    }).executer(emailContributeur, service, emetteur);
  },
});

module.exports = { fabriqueProcedures };

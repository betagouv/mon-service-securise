const {
  ajoutContributeurSurService,
} = require('../modeles/autorisations/ajoutContributeurSurService');

const fabriqueProcedures = ({
  depotDonnees,
  adaptateurMail,
  adaptateurTracking,
}) => ({
  ajoutContributeurSurService: async (emailContributeur, service, emetteur) => {
    await ajoutContributeurSurService({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    }).executer(emailContributeur, service, emetteur);
  },
});

module.exports = { fabriqueProcedures };

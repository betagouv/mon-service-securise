function relieEntrepriseEtContactBrevo({ crmBrevo }) {
  return async ({ utilisateur }) => {
    await crmBrevo.creerLienEntrepriseContact(utilisateur);
  };
}

module.exports = { relieEntrepriseEtContactBrevo };

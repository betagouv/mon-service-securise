function relieEntrepriseEtContactBrevo({ crmBrevo }) {
  return async ({ utilisateur }) => {
    await crmBrevo.creerLienEntrepriseContact(utilisateur);
  };
}

export { relieEntrepriseEtContactBrevo };

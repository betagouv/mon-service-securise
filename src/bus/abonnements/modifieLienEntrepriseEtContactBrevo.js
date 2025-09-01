function modifieLienEntrepriseEtContactBrevo({ crmBrevo }) {
  return async ({ utilisateur }) => {
    await crmBrevo.supprimerLienEntrepriseContact(utilisateur);
    await crmBrevo.creerLienEntrepriseContact(utilisateur);
  };
}

export { modifieLienEntrepriseEtContactBrevo };

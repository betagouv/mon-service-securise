const executeurApresAuthentification = (ordre, { reponse, adaptateurJWT }) => {
  switch (ordre.type) {
    case 'rendu':
      if (ordre.donnees) {
        reponse.render(ordre.cible, {
          tokenDonneesInvite: adaptateurJWT.signeDonnees(ordre.donnees),
        });
      } else {
        reponse.render(ordre.cible);
      }
      break;
    case 'redirection':
      if (ordre.donnees) {
        const token = adaptateurJWT.signeDonnees(ordre.donnees);
        reponse.redirect(`${ordre.cible}?token=${token}`);
      } else {
        reponse.redirect(`${ordre.cible}`);
      }
      break;
    default:
      break;
  }
};
module.exports = { executeurApresAuthentification };

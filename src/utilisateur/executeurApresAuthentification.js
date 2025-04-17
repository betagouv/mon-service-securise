const executeurApresAuthentification = (
  ordre,
  { reponse, adaptateurJWT, urlRedirection, adaptateurEnvironnement }
) => {
  switch (ordre.type) {
    case 'rendu':
      reponse.render(ordre.cible, {
        ...(ordre.donnees && {
          tokenDonneesInvite: adaptateurJWT.signeDonnees(ordre.donnees),
        }),
        ...(urlRedirection && {
          urlRedirection: `${adaptateurEnvironnement
            .mss()
            .urlBase()}${urlRedirection}`,
        }),
      });
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

const express = require("express");
const app = express();
const port = 3000;

let utilisateurs = {};

app.use(express.static("public"));
app.use(express.json());

app.get("/compte", (requete, reponse) => {
  const utilisateurCourant = requete.headers["x-auth-login"];
  const nomProjet = utilisateurs[utilisateurCourant];
  const payload = { utilisateurCourant, nomProjet };
  reponse.json(payload);
});

app.post("/compte", (requete, reponse) => {
  const pseudo = requete.body.pseudo;
  const payload = { pseudo };
  reponse.json(payload);
});

app.post("/service", (requete, reponse) => {
  const utilisateur = requete.headers["x-auth-login"];
  const nomService = requete.body.nomService;
  utilisateurs[utilisateur] = nomService;
  reponse.json({ nomService });
});

app.listen(port, () => {
  console.log(`Mon Service Sécurisé est démarré et écoute le port ${port} !…`);
});

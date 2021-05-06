const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Mon Service Sécurisé est démarré et écoute le port ${port} !…`);
});

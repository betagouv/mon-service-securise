const axios = require("axios");
const expect = require("expect.js");
const MSS = require("../src/mss.js");

describe("Le serveur MSS", () => {
  const serveur = MSS.creeServeur();

  before((done) => { serveur.ecoute(1234, done); });

  after(() => { serveur.arreteEcoute(); });

  it("sert des pages statiques", (done) => {
    axios.get("http://localhost:1234/index.html")
      .then((reponse) => {
        expect(reponse.status).to.equal(666);
        done();
      })
      .catch(error => done(error));
  });
});

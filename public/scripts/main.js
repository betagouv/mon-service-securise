let utilisateurCourant;

const compteACreer = document.getElementById("compte-a-creer");
const boutonCreationCompte = document.getElementById("submit-compte-a-creer");
const pseudo = document.getElementById("pseudo");
const boutonConnexion = document.getElementById("submit-pseudo");
const service = document.getElementById("service");
const inputNomService = document.getElementById("input-nom-service");

compteACreer.addEventListener("input", function () {
  boutonCreationCompte.disabled = (compteACreer.value === "");
});

pseudo.addEventListener("input", function () {
  boutonConnexion.disabled = (pseudo.value === "");
});

boutonCreationCompte.addEventListener("click", function () {
  const pseudo = compteACreer.value;
  const payload = JSON.stringify({ pseudo });

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/compte");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE) {
      utilisateurCourant = JSON.parse(xhr.responseText).pseudo;
      const divBienvenue = document.getElementById("message-bienvenue");
      divBienvenue.innerHTML = `<div>Hello ${utilisateurCourant}</div>`;
      service.classList.remove("invisible");

      compteACreer.value = "";
      inputNomService.value = "";
      compteACreer.dispatchEvent(new Event("input"));
    }
  };
  xhr.send(payload);
});

inputNomService.addEventListener("input", function () {
  console.log("event !");
  const nomService = inputNomService.value;
  const payload = JSON.stringify({ nomService });

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/service");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("x-auth-login", utilisateurCourant);
  xhr.send(payload);
});

boutonConnexion.addEventListener("click", function () {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "/compte");
  xhr.setRequestHeader("x-auth-login", pseudo.value);
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE) {
      utilisateurCourant = JSON.parse(xhr.responseText).utilisateurCourant;
      const divBienvenue = document.getElementById("message-bienvenue");
      divBienvenue.innerHTML = `<div>Hello ${utilisateurCourant}</div>`;
      service.classList.remove("invisible");

      const nomProjet = JSON.parse(xhr.responseText).nomProjet;
      const inputNomService = document.getElementById("input-nom-service");
      inputNomService.value = nomProjet;

      pseudo.value = "";
      pseudo.dispatchEvent(new Event("input"));
    }
  };
  xhr.send();
});

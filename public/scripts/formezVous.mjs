const declencheur = document.getElementById('declencheur-programme');
const modale = document.getElementById('modale-programme');

declencheur.addEventListener('click', () => {
  modale.setAttribute('opened', '');
});

modale.addEventListener('close', () => {
  modale.removeAttribute('opened');
  declencheur.focus();
});

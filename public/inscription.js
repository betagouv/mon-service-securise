$(() => {
  const $bouton = $('.bouton');
  const reponseOuiNon = (nom) => {
    const valeur = $(`input[name="${nom}"]:checked`).val();
    switch (valeur) {
      case 'oui': return true;
      case 'non': return false;
      default: return undefined;
    }
  };
  $bouton.on('click', () => {
    const prenom = $('#prenom').val();
    const nom = $('#nom').val();
    const email = $('#email').val();
    const telephone = $('#telephone').val();
    const rssi = reponseOuiNon('rssi');
    const delegueProtectionDonnees = reponseOuiNon('delegueProtectionDonnees');
    const poste = $('#poste').val();
    const nomEntitePublique = $('#nomEntitePublique').val();
    const departementEntitePublique = $('#departementEntitePublique').val();

    axios.post('/api/utilisateur', {
      prenom,
      nom,
      email,
      telephone,
      rssi,
      delegueProtectionDonnees,
      poste,
      nomEntitePublique,
      departementEntitePublique,
    }).then(() => (window.location = '/espacePersonnel'));
  });
});

$(() => {
  const $bouton = $('.bouton');
  $bouton.click(() => {
    const nomService = $('#nom-service').val();
    axios.post('/api/homologation', { nomService })
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});

$(() => {
  const brancheTelechargements = () => {
    const $liens = $('.document-homologation', 'form .documents');

    $liens.on('click', ({ target }) => (
      axios.put($(target).data('action-enregistrement'))
        .then(() => window.location.reload())
    ));
  };

  brancheTelechargements();
});

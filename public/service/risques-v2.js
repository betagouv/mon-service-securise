$(() => {
  const idService = $('.page-service').data('id-service');
  const { estLectureSeule } = JSON.parse($('#autorisations-risques').text());

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-risques', {
      detail: {
        idService,
        estLectureSeule,
      },
    })
  );
});

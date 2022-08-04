$(() => {
  $('.carte .details').hide();
  $('.carte .moins-details').hide();
  $('.carte .plus-details, .carte .moins-details').on('click', () => {
    $('.carte .details').toggle();
    $('.carte .plus-details, .carte .moins-details').toggle();
  });
});

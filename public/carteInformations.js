$(() => {
  $('.carte .details').hide();
  $('.carte .moins-details').hide();
  $('.carte .plus-details, .carte .moins-details').on('click', (e) => {
    $(e.target).parent().find('.details').toggle();
    $(e.target).parent().find('.plus-details, .moins-details').toggle();
  });
});

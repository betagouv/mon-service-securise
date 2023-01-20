const brancheMenuContextuelService = (selecteurMenuContextuel) => {
    const $menuContextuel = $(selecteurMenuContextuel);
    $('.options-menu', $menuContextuel).on('click', (e) => {
        e.preventDefault();
        const $service = $(e.target).parents('.service');
        $('.options-liste', $service).toggleClass('invisible');
        $('.masque', $service).toggleClass('invisible');

        $('.masque', $service).on('click', (e) => {
            e.preventDefault();
        });
    });
};

export default brancheMenuContextuelService;
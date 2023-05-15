import expect from 'expect.js';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';
import { $services } from '../../../public/modules/elementsDom/services.mjs';

describe("Le composant services de l'espace personnel", () => {
  let donneesService;
  let donneesServices;

  beforeEach(() => {
    const dom = new JSDOM('<div class = "services"></div>');
    global.$ = jquery(dom.window);
    global.document = dom.window.document;

    donneesService = {
      id: '789',
      createur: { id: '123' },
      contributeurs: [],
      nomService: 'Un service',
      organisationsResponsables: [],
    };
    donneesServices = [donneesService];
  });

  it('affiche un nombre maximum fixe de contributeurs distincts', () => {
    const idUtilisateur = donneesService.createur.id;
    donneesService.contributeurs = [
      { id: '999', initiales: 'BB' },
      { id: '000', initiales: 'AA' },
    ];

    const $resultat = $services(
      donneesServices,
      idUtilisateur,
      'classe-nouveau-contributeur',
      1
    );
    $('.services').append($resultat);

    const $premierService = $('.service').eq(0);
    const $contributeurs = $('.pastille.contributeur', $premierService);
    expect($contributeurs.length).to.equal(1);

    const initialesPremierContributeur = $contributeurs.eq(0).text().trim();
    expect(initialesPremierContributeur).to.equal('AA');
  });

  it('affiche une pastille pour tous les autres contributeurs supplémentaires', () => {
    const idUtilisateur = donneesService.createur.id;
    donneesService.contributeurs = [
      { id: '888', initiales: 'AA' },
      { id: '999', initiales: 'BB' },
      { id: '000', initiales: 'CC' },
    ];

    const $resultat = $services(
      donneesServices,
      idUtilisateur,
      'classe-nouveau-contributeur',
      1
    );
    $('.services').append($resultat);

    const $premierService = $('.service').eq(0);
    const $contributeursSupplementaires = $(
      '.pastille.contributeurs-supplementaires',
      $premierService
    );
    expect($contributeursSupplementaires.length).to.equal(1);

    const texteContributeursSupplementaires = $contributeursSupplementaires
      .eq(0)
      .text()
      .trim();
    expect(texteContributeursSupplementaires).to.equal('+2');
  });

  it("n'affiche pas de pastille pour les contributeurs supplémentaires s'il n'y en a pas", () => {
    const idUtilisateur = donneesService.createur.id;
    donneesService.contributeurs = [{ id: '888', initiales: 'AA' }];

    const $resultat = $services(
      donneesServices,
      idUtilisateur,
      'classe-nouveau-contributeur',
      1
    );
    $('.services').append($resultat);

    const $premierService = $('.service').eq(0);
    const $contributeursSupplementaires = $(
      '.pastille.contributeurs-supplementaires',
      $premierService
    );
    expect($contributeursSupplementaires.length).to.equal(0);
  });

  it('ajoute les attributs `data-organisation-responsable` du service', () => {
    donneesService.organisationsResponsables = ['ANSSI', 'Ministère'];

    const $resultat = $services(donneesServices, '', '', 1);

    $('.services').append($resultat);
    const $premierService = $('.service').eq(0);
    expect($premierService.data('organisation-responsable-0')).to.equal(
      'ANSSI'
    );
    expect($premierService.data('organisation-responsable-1')).to.equal(
      'Ministère'
    );
  });
});

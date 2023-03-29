const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const vueEspacePersonnel = require('../../../src/modeles/objetsVues/vueEspacePersonnel');

describe("L'objet de vue de l'espace personnel", () => {
  const unService = new Service({
    id: '123',
    descriptionService: { nomService: 'Un service', organisationsResponsables: ['Une organisation'] },
    createur: { email: 'email.createur@mail.fr', prenom: 'Jacques' },
    contributeurs: [{ email: 'email.contributeur1@mail.fr', prenom: 'Jean' }, { email: 'email.contributeur2@mail.fr', prenom: 'Jean II' }],
  });

  describe("quand l'utilisateur a qu'un seul service", () => {
    const services = [unService];

    it("contient l'identifiant du service", () => {
      const objetVueEspacePersonnel = vueEspacePersonnel.donnees(services);

      expect(objetVueEspacePersonnel.services.length).to.equal(1);
      expect(objetVueEspacePersonnel.services[0].id).to.equal('123');
    });

    it('contient le nom du service', () => {
      const objetVueEspacePersonnel = vueEspacePersonnel.donnees(services);

      expect(objetVueEspacePersonnel.services.length).to.equal(1);
      expect(objetVueEspacePersonnel.services[0].nomService).to.equal('Un service');
    });

    it('contient les données du créateur du service', () => {
      const objetVueEspacePersonnel = vueEspacePersonnel.donnees(services);

      expect(objetVueEspacePersonnel.services.length).to.equal(1);
      expect(objetVueEspacePersonnel.services[0].createur.prenomNom).to.equal('Jacques');
    });

    it('contient les données des contributeurs du service', () => {
      const objetVueEspacePersonnel = vueEspacePersonnel.donnees(services);

      expect(objetVueEspacePersonnel.services.length).to.equal(1);
      expect(objetVueEspacePersonnel.services[0].contributeurs.length).to.equal(2);
      expect(objetVueEspacePersonnel.services[0].contributeurs[0].prenomNom).to.equal('Jean');
      expect(objetVueEspacePersonnel.services[0].contributeurs[1].prenomNom).to.equal('Jean II');
    });
  });

  const unAutreService = new Service({
    id: '456',
    descriptionService: { nomService: 'Un autre service', organisationsResponsables: ['Une organisation', 'Une autre organisation'] },
    createur: { email: 'email.createur@mail.fr', prenom: 'Jacques' },
  });

  describe("quand l'utilisateur a plusieurs services", () => {
    it('contient une collection des données des services', () => {
      const services = [unService, unAutreService];

      const objetVueEspacePersonnel = vueEspacePersonnel.donnees(services);

      expect(objetVueEspacePersonnel.services.length).to.equal(2);
      expect(objetVueEspacePersonnel.services[0].nomService).to.equal('Un service');
      expect(objetVueEspacePersonnel.services[1].nomService).to.equal('Un autre service');
    });
  });

  it('contient les données agrégées pour les filtres', () => {
    const services = [unService, unAutreService];

    const objetVueEspacePersonnel = vueEspacePersonnel.donnees(services);

    expect(objetVueEspacePersonnel).to.have.property('donneesFiltres');
    expect(objetVueEspacePersonnel.donneesFiltres).to.have.property('parOrganisationsResponsables');
    expect(objetVueEspacePersonnel.donneesFiltres.parOrganisationsResponsables).to.eql([
      { nom: 'Une organisation', idServices: ['123', '456'] },
      { nom: 'Une autre organisation', idServices: ['456'] },
    ]);
  });
});

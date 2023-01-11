const expect = require('expect.js');

const Homologation = require('../../../src/modeles/homologation');
const VueAnnexePDFDescription = require('../../../src/modeles/objetsVues/vueAnnexePDFDescription');

describe("L'objet de vue de l'annexe de description", () => {
  const homologation = new Homologation({
    id: '123',
    idUtilisateur: '456',
    descriptionService: { nomService: 'Nom Service' },
  });

  it('fournit le nom du service', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(homologation);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('nomService');
    expect(donnees.nomService).to.equal('Nom Service');
  });
});

const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const Referentiel = require('../../../src/referentiel');
const VueAnnexePDFRisques = require('../../../src/modeles/objetsPDF/objetPDFAnnexeRisques');

describe("L'objet PDF des descriptions des risques", () => {
  const referentiel = Referentiel.creeReferentiel({
    niveauxGravite: {
      grave: { description: 'Une description', position: 1 },
    },
    vraisemblancesRisques: {
      probable: { description: 'Une description', position: 1 },
    },
    niveauxRisques: {
      orange: { correspondances: [{ gravite: 0, vraisemblance: 0 }] },
      rouge: { correspondances: [{ gravite: 1, vraisemblance: 1 }] },
    },
    risques: {
      unRisque: { description: 'Une description', identifiantNumerique: 'R1' },
      unSecondRisque: {
        description: 'Une description',
        identifiantNumerique: 'R2',
      },
    },
  });

  const service = new Service(
    {
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'Nom Service' },
      risquesGeneraux: [
        {
          id: 'unRisque',
          niveauGravite: 'grave',
          niveauVraisemblance: 'probable',
        },
      ],
    },
    referentiel
  );

  it('ajoute le nom du service', () => {
    const vueAnnexePDFRisques = new VueAnnexePDFRisques(service, referentiel);

    const donnees = vueAnnexePDFRisques.donnees();

    expect(donnees).to.have.key('nomService');
    expect(donnees.nomService).to.equal('Nom Service');
  });

  it("ajoute les risques par ordre d'identifiant numérique", () => {
    const vueAnnexePDFRisques = new VueAnnexePDFRisques(service, referentiel);

    const donnees = vueAnnexePDFRisques.donnees();

    expect(donnees).to.have.key('risques');
    expect(donnees.risques[0].identifiantNumerique).to.be('R1');
  });

  it('ajoute le risque dans la case de la grille correspondant à sa gravité et sa vraisemblance', () => {
    const vueAnnexePDFRisques = new VueAnnexePDFRisques(service, referentiel);

    const donnees = vueAnnexePDFRisques.donnees();

    expect(donnees.grilleRisques[3][0]).to.eql(['R1']);
  });
});

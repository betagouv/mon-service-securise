const expect = require('expect.js');
const {
  ErreurIdentifiantServiceManquant,
  ErreurAutorisationsServiceManquantes,
} = require('../../../src/modeles/journalMSS/erreurs');
const {
  EvenementCollaboratifServiceModifie,
} = require('../../../src/modeles/journalMSS/evenementCollaboratifServiceModifie');
const {
  RESUME_NIVEAU_DROIT,
} = require('../../../src/modeles/autorisations/autorisation');

const { PROPRIETAIRE } = RESUME_NIVEAU_DROIT;

describe("Un événement de modification du collaboratif d'un service", () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };
  const unEvenement = () =>
    new EvenementCollaboratifServiceModifie(
      {
        idService: 'abc',
        autorisations: [{ idUtilisateur: 'dupont', droit: PROPRIETAIRE }],
      },
      { date: '17/02/2024', adaptateurChiffrement: hacheEnMajuscules }
    );

  it("chiffre l'identifiant du service qui lui est donné", () => {
    expect(unEvenement().donnees.idService).to.be('ABC');
  });

  it('chiffre les idendifiants des collaborateurs qui lui sont donnés', () => {
    const id = unEvenement().donnees.autorisations[0].idUtilisateur;
    expect(id).to.be('DUPONT');
  });

  it('sait se convertir en JSON', () => {
    expect(unEvenement().toJSON()).to.eql({
      type: 'COLLABORATIF_SERVICE_MODIFIE',
      donnees: {
        idService: 'ABC',
        autorisations: [{ idUtilisateur: 'DUPONT', droit: 'PROPRIETAIRE' }],
      },
      date: '17/02/2024',
    });
  });

  const proprietesAVerifier = [
    { propriete: 'idService', typeErreur: ErreurIdentifiantServiceManquant },
    {
      propriete: 'autorisations',
      typeErreur: ErreurAutorisationsServiceManquantes,
    },
  ];
  proprietesAVerifier.forEach(({ propriete, typeErreur }) => {
    it(`exige que \`${propriete}\` soit renseigné`, (done) => {
      try {
        const donnees = { idService: 'abc' };
        delete donnees[propriete];

        new EvenementCollaboratifServiceModifie(donnees, {
          date: '17/11/2022',
          adaptateurChiffrement: hacheEnMajuscules,
        });

        done(
          Error("L'instanciation de l'événement aurait dû lever une exception")
        );
      } catch (e) {
        expect(e).to.be.an(typeErreur);
        done();
      }
    });
  });
});

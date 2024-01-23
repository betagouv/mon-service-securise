const expect = require('expect.js');
const EvenementRetourUtilisateurMesure = require('../../../src/modeles/journalMSS/evenementRetourUtilisateurMesure');
const {
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
  ErreurIdentifiantMesureManquant,
  ErreurIdentifiantRetourUtilisateurManquant,
} = require('../../../src/modeles/journalMSS/erreurs');

describe('Un événement de retour utilisateur sur une mesure', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };
  const unEvenement = () =>
    new EvenementRetourUtilisateurMesure(
      {
        idService: 'abc',
        idUtilisateur: 'def',
        idMesure: 'uneMesure',
        idRetour: 'unRetour',
        commentaire: 'unCommentaire',
      },
      {
        date: '17/11/2022',
        adaptateurChiffrement: hacheEnMajuscules,
      }
    );

  it("chiffre l'identifiant du service qui lui est donné", () => {
    expect(unEvenement().donnees.idService).to.be('ABC');
  });

  it("chiffre l'identifiant de l'utilisateur qui lui est donné", () => {
    expect(unEvenement().donnees.idUtilisateur).to.be('DEF');
  });

  it('sait se convertir en JSON', () => {
    expect(unEvenement().toJSON()).to.eql({
      type: 'RETOUR_UTILISATEUR_MESURE_RECU',
      donnees: {
        idService: 'ABC',
        idUtilisateur: 'DEF',
        idMesure: 'uneMesure',
        idRetour: 'unRetour',
        commentaire: 'unCommentaire',
      },
      date: '17/11/2022',
    });
  });

  const proprietesAVerifier = [
    { propriete: 'idService', typeErreur: ErreurIdentifiantServiceManquant },
    {
      propriete: 'idUtilisateur',
      typeErreur: ErreurIdentifiantUtilisateurManquant,
    },
    { propriete: 'idMesure', typeErreur: ErreurIdentifiantMesureManquant },
    {
      propriete: 'idRetour',
      typeErreur: ErreurIdentifiantRetourUtilisateurManquant,
    },
  ];
  proprietesAVerifier.forEach(({ propriete, typeErreur }) => {
    it(`exige que \`${propriete}\` soit renseigné`, (done) => {
      try {
        const donnees = {
          idService: 'abc',
          idUtilisateur: 'def',
          idMesure: 'uneMesure',
          idRetour: 'unRetour',
          commentaire: 'unCommentaire',
        };
        delete donnees[propriete];
        new EvenementRetourUtilisateurMesure(donnees, {
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

  it('limite la longueur du commentaire à 2 000 caractères pour éviter les contenus mal intentionnés', () => {
    const tropLong = new Array(2000 + 500).fill('a').join('');

    const evenement = new EvenementRetourUtilisateurMesure(
      {
        idService: 'abc',
        idUtilisateur: 'def',
        idMesure: 'uneMesure',
        idRetour: 'unRetour',
        commentaire: tropLong,
      },
      {
        date: '17/11/2022',
        adaptateurChiffrement: hacheEnMajuscules,
      }
    );

    expect(evenement.toJSON().donnees.commentaire.length).to.equal(2000);
  });
});

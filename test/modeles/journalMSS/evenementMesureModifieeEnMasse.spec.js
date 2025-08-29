import expect from 'expect.js';
import { EvenementMesureModifieeEnMasse } from '../../../src/modeles/journalMSS/evenementMesureModifieeEnMasse.js';

describe('Un événement de mesure modifiée en masse', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant utilisateur qui lui est donné", () => {
    const evenement = new EvenementMesureModifieeEnMasse(
      { idUtilisateur: 'def' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('DEF');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementMesureModifieeEnMasse(
      {
        idUtilisateur: 'def',
        idMesure: 'uneMesure',
        statutModifie: true,
        modalitesModifiees: false,
        nombreServicesConcernes: 2,
        type: 'generale',
      },
      { date: 1751358284051, adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'MESURE_MODIFIEE_EN_MASSE',
      donnees: {
        idUtilisateur: 'DEF',
        idMesure: 'uneMesure',
        statutModifie: true,
        modalitesModifiees: false,
        nombreServicesConcernes: 2,
        type: 'generale',
      },
      date: 1751358284051,
    });
  });
});

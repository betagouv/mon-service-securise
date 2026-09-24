import EvenementProfilUtilisateurModifie from '../../../src/modeles/journalMSS/evenementProfilUtilisateurModifie.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.ts';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';

describe('Un événement de profil utilisateur modifié', () => {
  it("consigne l'identifiant haché de l'utilisateur, son département, ses rôles et son estimation de nombre de services", () => {
    const evenement = new EvenementProfilUtilisateurModifie(
      unUtilisateur()
        .avecId('abc')
        .quiDependDu('33')
        .avecPostes(['RSSI', 'DPO'])
        .construis(),
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'PROFIL_UTILISATEUR_MODIFIE',
      donnees: {
        idUtilisateur: 'ABC',
        departementOrganisation: '33',
        roles: ['RSSI', 'DPO'],
        estimationNombreServices: { borneBasse: '1', borneHaute: '10' },
      },
      date: '17/11/2022',
    });
  });

  it("exige que l'utilisateur soit renseigné", () => {
    expect(
      () =>
        // @ts-expect-error On force volontairement l'absence d'utilisateur
        new EvenementProfilUtilisateurModifie(null, {
          adaptateurChiffrement: hacheEnMajuscules,
        })
    ).toThrow(ErreurDonneeManquante);
  });
});

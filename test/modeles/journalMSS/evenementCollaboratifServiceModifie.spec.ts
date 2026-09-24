import { EvenementCollaboratifServiceModifie } from '../../../src/modeles/journalMSS/evenementCollaboratifServiceModifie.ts';
import { Autorisation } from '../../../src/modeles/autorisations/autorisation.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

const { PROPRIETAIRE } = Autorisation.RESUME_NIVEAU_DROIT;

describe("Un événement de modification du collaboratif d'un service", () => {
  it("consigne l'identifiant haché du service et les autorisations avec les identifiants hachés des collaborateurs", () => {
    const evenement = new EvenementCollaboratifServiceModifie(
      {
        idService: unUUID('a'),
        autorisations: [{ idUtilisateur: unUUID('d'), droit: PROPRIETAIRE }],
      },
      { date: '17/02/2024', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'COLLABORATIF_SERVICE_MODIFIE',
      donnees: {
        idService: unUUID('A'),
        autorisations: [{ idUtilisateur: unUUID('D'), droit: 'PROPRIETAIRE' }],
      },
      date: '17/02/2024',
    });
  });
});

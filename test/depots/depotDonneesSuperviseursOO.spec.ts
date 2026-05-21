import { DepotDonneesSuperviseursOO } from '../../src/depots/depotDonneesSuperviseursOO.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import Superviseur from '../../src/modeles/superviseur.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';

describe('Le dépôt de données OO des superviseurs', () => {
  const idSuperviseur = unUUID('S');

  describe("sur demande de lecture d'un superviseur", () => {
    it('peut lire un superviseur via son ID', async () => {
      const persistance = unePersistanceMemoireTS()
        .ajouteSuperviseurSurPerimetre(idSuperviseur, [{ siret: 'siret-A' }])
        .construis();
      const depot = new DepotDonneesSuperviseursOO({ persistance });

      const superviseur = await depot.lisSuperviseur(idSuperviseur);

      expect(superviseur).toBeInstanceOf(Superviseur);
      expect(superviseur!.donnees().idUtilisateur).toBe(idSuperviseur);
    });

    it("ne retourne rien si l'utilisateur demandé n'est pas superviseur", async () => {
      const persistanceVide = unePersistanceMemoireTS().construis();
      const depot = new DepotDonneesSuperviseursOO({
        persistance: persistanceVide,
      });

      const superviseur = await depot.lisSuperviseur(unUUID('X'));

      expect(superviseur).toBeUndefined();
    });
  });

  describe("sur demande de lecture des superviseurs d'une organisation", () => {
    it("retourne une liste vide s'il n'y en a pas", async () => {
      const persistanceVide = unePersistanceMemoireTS().construis();
      const depot = new DepotDonneesSuperviseursOO({
        persistance: persistanceVide,
      });

      const superviseurs = await depot.lisSuperviseursPour('siret-inconnu');

      expect(superviseurs).toEqual([]);
    });

    it('retourne les superviseurs concernés par le siret', async () => {
      const persistance = unePersistanceMemoireTS()
        .ajouteSuperviseurSurPerimetre(unUUID('S1'), [{ siret: 'siret-A' }])
        .ajouteSuperviseurSurPerimetre(unUUID('S2'), [{ siret: 'siret-B' }])
        .ajouteSuperviseurSurPerimetre(unUUID('S3'), [
          { siret: 'siret-B' },
          { siret: 'siret-A' },
        ])
        .construis();
      const depot = new DepotDonneesSuperviseursOO({ persistance });

      const superviseurs = await depot.lisSuperviseursPour('siret-A');

      expect(superviseurs).toHaveLength(2);
      expect(superviseurs[0]).toBeInstanceOf(Superviseur);
      expect(superviseurs[0].donnees().idUtilisateur).toBe(unUUID('S1'));
      expect(superviseurs[1]).toBeInstanceOf(Superviseur);
      expect(superviseurs[1].donnees().idUtilisateur).toBe(unUUID('S3'));
    });
  });

  describe("sur demande de vérification qu'un utilisateur est superviseur", () => {
    it('retourne vrai si le superviseur existe', async () => {
      const persistance = unePersistanceMemoireTS()
        .ajouteSuperviseurSurPerimetre(idSuperviseur, [{ siret: 'siret-A' }])
        .construis();
      const depot = new DepotDonneesSuperviseursOO({ persistance });

      expect(await depot.estSuperviseur(idSuperviseur)).toBe(true);
    });

    it("retourne faux si l'utilisateur n'est pas superviseur", async () => {
      const persistanceVide = unePersistanceMemoireTS().construis();
      const depot = new DepotDonneesSuperviseursOO({
        persistance: persistanceVide,
      });

      expect(await depot.estSuperviseur(unUUID('X'))).toBe(false);
    });
  });

  it('supprime un superviseur', async () => {
    const persistance = unePersistanceMemoireTS()
      .ajouteSuperviseurSurPerimetre(idSuperviseur, [{ siret: 'siret-A' }])
      .construis();
    const depot = new DepotDonneesSuperviseursOO({ persistance });

    await depot.supprimeSuperviseur(idSuperviseur);

    expect(await depot.lisSuperviseur(idSuperviseur)).toBeUndefined();
  });

  it('sauvegarde un superviseur', async () => {
    const persistance = unePersistanceMemoireTS()
      .ajouteSuperviseurSurPerimetre(idSuperviseur, [
        { siret: 'siret-B' },
        { siret: 'siret-A' },
      ])
      .construis();
    const depot = new DepotDonneesSuperviseursOO({ persistance });
    const superviseur = Superviseur.hydrate({
      idUtilisateur: idSuperviseur,
      entitesSupervisees: [{ siret: 'siret-B' }, { siret: 'siret-C' }],
    });

    await depot.sauvegardeSuperviseur(superviseur);

    const superviseurSauvegarde = await depot.lisSuperviseur(idSuperviseur);
    expect(superviseurSauvegarde!.donnees().idUtilisateur).toBe(idSuperviseur);
    expect(superviseurSauvegarde!.donnees().entitesSupervisees).toHaveLength(2);
    expect(superviseurSauvegarde!.donnees().entitesSupervisees[0]).toEqual({
      siret: 'siret-B',
    });
    expect(superviseurSauvegarde!.donnees().entitesSupervisees[1]).toEqual({
      siret: 'siret-C',
    });
  });
});

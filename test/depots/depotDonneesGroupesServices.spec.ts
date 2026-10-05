import { DepotDonneesGroupesServices } from '../../src/depots/depotDonneesGroupesServices.ts';
import { PersistanceTS } from '../../src/adaptateurs/persistanceTS.interface.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { GroupeServices } from '../../src/modeles/groupeServices.ts';
import {
  ErreurGroupeServicesDejaExistant,
  ErreurGroupeServicesInexistant,
} from '../../src/erreurs.ts';

describe('Le dépôt de données des groupes de services', () => {
  let persistance: PersistanceTS;

  beforeEach(() => {
    persistance = unePersistanceMemoireTS().construis();
  });

  const unDepot = () => new DepotDonneesGroupesServices({ persistance });

  describe("sur demande d'un nouveau groupe", () => {
    it('persiste le groupe et le renvoie', async () => {
      const groupe = await unDepot().nouveauGroupe(unUUID('U'), 'Métier');

      expect(groupe).toBeInstanceOf(GroupeServices);
      const [groupeLu] = await persistance.lisGroupesServicesDe(unUUID('U'));
      expect(groupeLu).toEqual(groupe.donnees());
    });

    it("refuse un libellé déjà utilisé par l'utilisateur, espaces superflus compris", async () => {
      const depot = unDepot();
      await depot.nouveauGroupe(unUUID('U'), 'Métier');

      await expect(
        depot.nouveauGroupe(unUUID('U'), '  Métier ')
      ).rejects.toThrow(ErreurGroupeServicesDejaExistant);
    });

    it('accepte un libellé qui ne diffère que par la casse ou les accents', async () => {
      const depot = unDepot();
      await depot.nouveauGroupe(unUUID('U'), 'Metier');

      await depot.nouveauGroupe(unUUID('U'), 'métier');
      await depot.nouveauGroupe(unUUID('U'), 'Métier');

      const groupes = await depot.lisGroupesDe(unUUID('U'));
      expect(groupes).toHaveLength(3);
    });

    it('accepte un libellé déjà utilisé par un autre utilisateur', async () => {
      const depot = unDepot();
      await depot.nouveauGroupe(unUUID('A'), 'Métier');

      await depot.nouveauGroupe(unUUID('B'), 'Métier');

      const groupesDeB = await depot.lisGroupesDe(unUUID('B'));
      expect(groupesDeB).toHaveLength(1);
    });
  });

  describe("sur demande des groupes d'un utilisateur", () => {
    it('renvoie uniquement ses groupes', async () => {
      const depot = unDepot();
      const sonGroupe = await depot.nouveauGroupe(unUUID('U'), 'Métier');
      await depot.nouveauGroupe(unUUID('A'), 'Support');

      const groupes = await depot.lisGroupesDe(unUUID('U'));

      expect(groupes.map((c) => c.donnees())).toEqual([sonGroupe.donnees()]);
    });
  });

  describe("sur demande de renommage d'un groupe", () => {
    it('persiste le nouveau libellé', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(unUUID('U'), 'Métier');

      await depot.renommeGroupe(groupe.donnees().id, unUUID('U'), 'Support');

      const [groupeLu] = await depot.lisGroupesDe(unUUID('U'));
      expect(groupeLu.donnees().libelle).toBe('Support');
    });

    it("refuse un libellé déjà utilisé par un autre groupe de l'utilisateur", async () => {
      const depot = unDepot();
      await depot.nouveauGroupe(unUUID('U'), 'Métier');
      const support = await depot.nouveauGroupe(unUUID('U'), 'Support');

      await expect(
        depot.renommeGroupe(support.donnees().id, unUUID('U'), 'Métier')
      ).rejects.toThrow(ErreurGroupeServicesDejaExistant);
      const libelles = (await depot.lisGroupesDe(unUUID('U'))).map(
        (c) => c.donnees().libelle
      );
      expect(libelles).toEqual(['Métier', 'Support']);
    });

    it('accepte de conserver le même libellé', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(unUUID('U'), 'Métier');

      await depot.renommeGroupe(groupe.donnees().id, unUUID('U'), ' Métier ');

      const [groupeLu] = await depot.lisGroupesDe(unUUID('U'));
      expect(groupeLu.donnees().libelle).toBe('Métier');
    });

    it("refuse de renommer le groupe d'un autre utilisateur", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(unUUID('A'), 'Métier');

      await expect(
        depot.renommeGroupe(groupe.donnees().id, unUUID('B'), 'Support')
      ).rejects.toThrow(ErreurGroupeServicesInexistant);
      const [groupeDeA] = await depot.lisGroupesDe(unUUID('A'));
      expect(groupeDeA.donnees().libelle).toBe('Métier');
    });
  });

  describe("sur demande de suppression d'un groupe", () => {
    it('supprime le groupe', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(unUUID('U'), 'Métier');

      await depot.supprimeGroupe(groupe.donnees().id, unUUID('U'));

      expect(await depot.lisGroupesDe(unUUID('U'))).toEqual([]);
    });

    it("refuse de supprimer le groupe d'un autre utilisateur", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(unUUID('A'), 'Métier');

      await expect(
        depot.supprimeGroupe(groupe.donnees().id, unUUID('B'))
      ).rejects.toThrow(ErreurGroupeServicesInexistant);
      expect(await depot.lisGroupesDe(unUUID('A'))).toHaveLength(1);
    });
  });

  describe("sur demande d'association de services à des groupes", () => {
    const idUtilisateur = unUUID('U');

    it('ajoute un service dans un groupe vide', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(idUtilisateur, 'Métier');

      await depot.metsAJourAssociationsAuxServices(
        idUtilisateur,
        [groupe.donnees().id],
        [unUUID('S1')]
      );

      const groupes = await depot.lisGroupesDe(idUtilisateur);
      expect(groupes[0].donnees().idServicesAssocies).toEqual([unUUID('S1')]);
    });

    it("retire un service d'un groupe dans lequel il ne figure plus", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(idUtilisateur, 'Métier');
      await depot.metsAJourAssociationsAuxServices(
        idUtilisateur,
        [groupe.donnees().id],
        [unUUID('S1')]
      );

      await depot.metsAJourAssociationsAuxServices(
        idUtilisateur,
        [],
        [unUUID('S1')]
      );

      const groupes = await depot.lisGroupesDe(idUtilisateur);
      expect(groupes[0].donnees().idServicesAssocies).toEqual([]);
    });
  });
});

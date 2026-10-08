import { DepotDonneesGroupesEntites } from '../../src/depots/depotDonneesGroupesEntites.ts';
import { PersistanceTS } from '../../src/adaptateurs/persistanceTS.interface.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { GroupeEntites } from '../../src/modeles/groupeEntites.ts';
import { DepotDonneesAdminsOrganisations } from '../../src/depots/depotDonneesAdminsOrganisations.ts';
import { DepotDonneesSuperviseurs } from '../../src/depots/depotDonneesSuperviseurs.ts';
import {
  ErreurGroupeEntitesDejaExistant,
  ErreurEntiteNonAdministre,
  ErreurGroupeEntitesInexistant,
} from '../../src/erreurs.ts';

describe("Le dépôt de données des groupes d'entités", () => {
  let persistance: PersistanceTS;

  beforeEach(() => {
    persistance = unePersistanceMemoireTS().construis();
  });

  const unDepot = () =>
    new DepotDonneesGroupesEntites({
      persistance,
      depotAdminsOrganisations: new DepotDonneesAdminsOrganisations({
        persistance,
      }),
      depotSuperviseurs: new DepotDonneesSuperviseurs({ persistance }),
    });

  describe("sur demande d'un nouveau groupe", () => {
    it('persiste le groupe et le renvoie', async () => {
      const groupe = await unDepot().nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );

      expect(groupe).toBeInstanceOf(GroupeEntites);
      const [groupeLu] = await persistance.lisGroupesEntitesDe(unUUID('U'), []);
      expect(groupeLu).toEqual(groupe.donnees());
    });

    it("refuse un libellé déjà utilisé par l'utilisateur, espaces superflus compris", async () => {
      const depot = unDepot();
      await depot.nouveauGroupeEntites(unUUID('U'), 'Région Nord');

      await expect(
        depot.nouveauGroupeEntites(unUUID('U'), '  Région Nord ')
      ).rejects.toThrow(ErreurGroupeEntitesDejaExistant);
    });
  });

  describe("sur demande des groupes d'un utilisateur", () => {
    it('renvoie uniquement ses groupes', async () => {
      const depot = unDepot();
      const sonGroupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );
      await depot.nouveauGroupeEntites(unUUID('A'), 'Région Sud');

      const groupes = await depot.lisGroupesEntitesDe(unUUID('U'));

      expect(groupes).toEqual([sonGroupe]);
    });

    it("renvoie pour un admin les SIRET associés qu'il administre", async () => {
      persistance = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(unUUID('U'), [{ siret: '11111111100011' }])
        .construis();
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );
      await persistance.associeEntitesAuGroupe(groupe.donnees().id, [
        '11111111100011',
        '22222222200022',
      ]);

      const [groupeLu] = await depot.lisGroupesEntitesDe(unUUID('U'));

      expect(groupeLu.donnees().siretsAssocies).toEqual(['11111111100011']);
    });

    it("renvoie pour un superviseur les SIRET associés qu'il supervise", async () => {
      persistance = unePersistanceMemoireTS()
        .ajouteSuperviseurSurPerimetre(unUUID('U'), [
          { siret: '11111111100011' },
        ])
        .construis();
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );
      await persistance.associeEntitesAuGroupe(groupe.donnees().id, [
        '11111111100011',
        '22222222200022',
      ]);

      const [groupeLu] = await depot.lisGroupesEntitesDe(unUUID('U'));

      expect(groupeLu.donnees().siretsAssocies).toEqual(['11111111100011']);
    });

    it('renvoie uniquement les SIRET administrés pour un utilisateur à la fois admin et superviseur', async () => {
      persistance = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(unUUID('U'), [{ siret: '11111111100011' }])
        .ajouteSuperviseurSurPerimetre(unUUID('U'), [
          { siret: '22222222200022' },
        ])
        .construis();
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );
      await persistance.associeEntitesAuGroupe(groupe.donnees().id, [
        '11111111100011',
        '22222222200022',
      ]);

      const [groupeLu] = await depot.lisGroupesEntitesDe(unUUID('U'));

      expect(groupeLu.donnees().siretsAssocies).toEqual(['11111111100011']);
    });
  });

  describe("sur demande de renommage d'un groupe", () => {
    it('persiste le nouveau libellé', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );

      await depot.renommeGroupeEntites(
        groupe.donnees().id,
        unUUID('U'),
        'Région Sud'
      );

      const groupes = await depot.lisGroupesEntitesDe(unUUID('U'));
      expect(groupes.map((g) => g.donnees().libelle)).toEqual(['Région Sud']);
    });

    it("refuse un libellé déjà utilisé par un autre groupe de l'utilisateur", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );
      await depot.nouveauGroupeEntites(unUUID('U'), 'Région Sud');

      await expect(
        depot.renommeGroupeEntites(
          groupe.donnees().id,
          unUUID('U'),
          'Région Sud'
        )
      ).rejects.toThrow(ErreurGroupeEntitesDejaExistant);
    });

    it('accepte de conserver le même libellé', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );

      await depot.renommeGroupeEntites(
        groupe.donnees().id,
        unUUID('U'),
        'Région Nord'
      );

      const groupes = await depot.lisGroupesEntitesDe(unUUID('U'));
      expect(groupes.map((g) => g.donnees().libelle)).toEqual(['Région Nord']);
    });

    it("refuse de renommer le groupe d'un autre utilisateur", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('A'),
        'Région Nord'
      );

      await expect(
        depot.renommeGroupeEntites(groupe.donnees().id, unUUID('U'), 'Piraté')
      ).rejects.toThrow(ErreurGroupeEntitesInexistant);
    });
  });

  describe("sur demande de suppression d'un groupe", () => {
    it('supprime le groupe', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );

      await depot.supprimeGroupeEntites(groupe.donnees().id, unUUID('U'));

      const groupes = await depot.lisGroupesEntitesDe(unUUID('U'));
      expect(groupes).toEqual([]);
    });

    it("refuse de supprimer le groupe d'un autre utilisateur", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('A'),
        'Région Nord'
      );

      await expect(
        depot.supprimeGroupeEntites(groupe.donnees().id, unUUID('U'))
      ).rejects.toThrow(ErreurGroupeEntitesInexistant);
      expect(await depot.lisGroupesEntitesDe(unUUID('A'))).toHaveLength(1);
    });
  });

  describe("sur demande d'association d'entités à des groupes", () => {
    beforeEach(() => {
      persistance = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(unUUID('U'), [
          { siret: '11111111100011' },
          { siret: '22222222200022' },
        ])
        .construis();
    });

    it('ajoute une entité dans un groupe', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );

      await depot.associeEntitesAuxGroupes(
        unUUID('U'),
        [groupe.donnees().id],
        ['11111111100011']
      );

      const [groupeLu] = await depot.lisGroupesEntitesDe(unUUID('U'));
      expect(groupeLu.donnees().siretsAssocies).toEqual(['11111111100011']);
    });

    it("jette une erreur si une des entités n'est pas dans le périmètre de l'utilisateur", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );

      await expect(
        depot.associeEntitesAuxGroupes(
          unUUID('U'),
          [groupe.donnees().id],
          ['11111111100011', '99999999900099']
        )
      ).rejects.toThrow(ErreurEntiteNonAdministre);
      const [groupeLu] = await depot.lisGroupesEntitesDe(unUUID('U'));
      expect(groupeLu.donnees().siretsAssocies).toEqual([]);
    });

    it("jette une erreur si un des groupes n'appartient pas à l'utilisateur", async () => {
      const depot = unDepot();
      const sonGroupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );
      const groupeDeA = await depot.nouveauGroupeEntites(
        unUUID('A'),
        'Région Sud'
      );

      await expect(
        depot.associeEntitesAuxGroupes(
          unUUID('U'),
          [sonGroupe.donnees().id, groupeDeA.donnees().id],
          ['11111111100011']
        )
      ).rejects.toThrow(ErreurGroupeEntitesInexistant);
      const [groupeLu] = await depot.lisGroupesEntitesDe(unUUID('U'));
      expect(groupeLu.donnees().siretsAssocies).toEqual([]);
    });
  });

  describe("sur demande de dissociation d'entités d'un groupe", () => {
    beforeEach(() => {
      persistance = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(unUUID('U'), [
          { siret: '11111111100011' },
          { siret: '22222222200022' },
        ])
        .construis();
    });

    it("retire une entité d'un groupe", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );
      await depot.associeEntitesAuxGroupes(
        unUUID('U'),
        [groupe.donnees().id],
        ['11111111100011', '22222222200022']
      );

      await depot.supprimeAssociationEntitesAuGroupe(
        unUUID('U'),
        groupe.donnees().id,
        ['11111111100011']
      );

      const [groupeLu] = await depot.lisGroupesEntitesDe(unUUID('U'));
      expect(groupeLu.donnees().siretsAssocies).toEqual(['22222222200022']);
    });

    it("jette une erreur si le groupe n'appartient pas à l'utilisateur", async () => {
      const depot = unDepot();
      const groupeDeA = await depot.nouveauGroupeEntites(
        unUUID('A'),
        'Région Nord'
      );

      await expect(
        depot.supprimeAssociationEntitesAuGroupe(
          unUUID('U'),
          groupeDeA.donnees().id,
          ['11111111100011']
        )
      ).rejects.toThrow(ErreurGroupeEntitesInexistant);
    });

    it("jette une erreur si une des entités n'est pas dans le périmètre de l'utilisateur", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupeEntites(
        unUUID('U'),
        'Région Nord'
      );

      await expect(
        depot.supprimeAssociationEntitesAuGroupe(
          unUUID('U'),
          groupe.donnees().id,
          ['99999999900099']
        )
      ).rejects.toThrow(ErreurEntiteNonAdministre);
    });
  });
});

import { DepotDonneesGroupesServices } from '../../src/depots/depotDonneesGroupesServices.ts';
import { PersistanceTS } from '../../src/adaptateurs/persistanceTS.interface.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import { unUUID, unUUIDRandom } from '../constructeurs/UUID.ts';
import { GroupeServices } from '../../src/modeles/groupeServices.ts';
import {
  ErreurGroupeServicesDejaExistant,
  ErreurGroupeServicesInexistant,
  ErreurServiceInexistant,
} from '../../src/erreurs.ts';
import { creeDepot as creeDepotAutorisation } from '../../src/depots/depotDonneesAutorisations.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { DepotDonneesAutorisation } from '../../src/depots/depotDonneesAutorisations.interface.ts';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import BusEvenements from '../../src/bus/busEvenements.js';
import { EvenementGroupeServicesCree } from '../../src/bus/evenementGroupeServicesCree.ts';
import { EvenementGroupeServicesSupprime } from '../../src/bus/evenementGroupeServicesSupprime.ts';
import { EvenementServicesDuGroupeModifies } from '../../src/bus/evenementServicesDuGroupeModifies.ts';

describe('Le dépôt de données des groupes de services', () => {
  let persistance: PersistanceTS;
  let depotAutorisations: DepotDonneesAutorisation;
  let busEvenements: ReturnType<typeof fabriqueBusPourLesTests>;

  beforeEach(() => {
    persistance = unePersistanceMemoireTS().construis();
    busEvenements = fabriqueBusPourLesTests();
    depotAutorisations = creeDepotAutorisation({
      adaptateurPersistance: unePersistanceMemoire().construis(),
      busEvenements: fabriqueBusPourLesTests(),
    });
  });

  const unDepot = () =>
    new DepotDonneesGroupesServices({
      persistance,
      depotAutorisations,
      busEvenements: busEvenements as unknown as BusEvenements,
    });

  describe("sur demande d'un nouveau groupe", () => {
    it('persiste le groupe et le renvoie', async () => {
      const groupe = await unDepot().nouveauGroupe(unUUID('U'), 'Métier');

      expect(groupe).toBeInstanceOf(GroupeServices);
      const [groupeLu] = await persistance.lisGroupesServicesDe(unUUID('U'));
      expect(groupeLu).toEqual(groupe.donnees());
    });

    it('publie un évènement de groupe créé sur le bus', async () => {
      const groupe = await unDepot().nouveauGroupe(unUUID('U'), 'Métier');

      expect(
        busEvenements.recupereEvenement(EvenementGroupeServicesCree)
      ).toEqual(new EvenementGroupeServicesCree({ groupe }));
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

    it('publie un évènement de groupe supprimé sur le bus', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(unUUID('U'), 'Métier');

      await depot.supprimeGroupe(groupe.donnees().id, unUUID('U'));

      expect(
        busEvenements.recupereEvenement(EvenementGroupeServicesSupprime)
      ).toEqual(new EvenementGroupeServicesSupprime({ groupe }));
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

  describe("sur demande de suppression d'une association entre un groupe et des services", () => {
    const idUtilisateur = unUUID('U');
    const idService = unUUID('S1');

    beforeEach(async () => {
      await depotAutorisations.sauvegardeAutorisation(
        uneAutorisation().deProprietaire(idUtilisateur, idService).construis()
      );
    });

    it("retire un service d'un groupe dans lequel il ne doit plus figurer", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(idUtilisateur, 'Métier');
      await depot.associeServicesAuxGroupes(
        idUtilisateur,
        [groupe.donnees().id],
        [idService]
      );

      await depot.supprimeAssociationServicesAuGroupe(
        idUtilisateur,
        groupe.donnees().id,
        [idService]
      );

      const groupes = await depot.lisGroupesDe(idUtilisateur);
      expect(groupes[0].donnees().idServicesAssocies).toEqual([]);
    });

    it('publie un évènement de services du groupe modifiés, avec le nouveau nombre de services associés', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(idUtilisateur, 'Métier');
      await depot.associeServicesAuxGroupes(
        idUtilisateur,
        [groupe.donnees().id],
        [idService]
      );
      busEvenements.videEvenements();

      await depot.supprimeAssociationServicesAuGroupe(
        idUtilisateur,
        groupe.donnees().id,
        [idService]
      );

      const evenement = busEvenements.recupereEvenement(
        EvenementServicesDuGroupeModifies
      );
      expect(evenement.groupe.donnees().id).toBe(groupe.donnees().id);
      expect(evenement.nombreServicesAssocies).toBe(0);
    });

    it("jette une erreur si un des services n'est pas accessible à l'utilisateur", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(idUtilisateur, 'Métier');

      await expect(
        depot.supprimeAssociationServicesAuGroupe(
          idUtilisateur,
          groupe.donnees().id,
          [unUUID('S2')]
        )
      ).rejects.toThrow(new ErreurServiceInexistant());
    });

    it("jette une erreur si un des groupes n'appartient pas à l'utilisateur", async () => {
      const depot = unDepot();

      await expect(
        depot.supprimeAssociationServicesAuGroupe(
          idUtilisateur,
          unUUIDRandom(),
          [idService]
        )
      ).rejects.toThrow(new ErreurGroupeServicesInexistant());
    });
  });

  describe("sur demande d'association de services à des groupes", () => {
    const idUtilisateur = unUUID('U');
    const idService = unUUID('S1');

    beforeEach(async () => {
      await depotAutorisations.sauvegardeAutorisation(
        uneAutorisation().deProprietaire(idUtilisateur, idService).construis()
      );
    });

    it('ajoute un service dans un groupe', async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(idUtilisateur, 'Métier');
      await depot.associeServicesAuxGroupes(
        idUtilisateur,
        [groupe.donnees().id],
        [idService]
      );

      const groupes = await depot.lisGroupesDe(idUtilisateur);
      expect(groupes[0].donnees().idServicesAssocies).toEqual([idService]);
    });

    it('publie un évènement de services du groupe modifiés par groupe, avec le nouveau nombre de services associés', async () => {
      const depot = unDepot();
      const metier = await depot.nouveauGroupe(idUtilisateur, 'Métier');
      const support = await depot.nouveauGroupe(idUtilisateur, 'Support');
      await depot.associeServicesAuxGroupes(
        idUtilisateur,
        [support.donnees().id],
        [idService]
      );
      busEvenements.videEvenements();

      await depot.associeServicesAuxGroupes(
        idUtilisateur,
        [metier.donnees().id, support.donnees().id],
        [idService]
      );

      const evenements = busEvenements.recupereEvenements(
        EvenementServicesDuGroupeModifies
      );
      expect(evenements).toHaveLength(2);
      expect(
        evenements.map((e) => [e.groupe.donnees().id, e.nombreServicesAssocies])
      ).toEqual([
        [metier.donnees().id, 1],
        [support.donnees().id, 1],
      ]);
    });

    it("ne publie pas d'évènement si l'association est refusée", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(idUtilisateur, 'Métier');

      await expect(
        depot.associeServicesAuxGroupes(
          idUtilisateur,
          [groupe.donnees().id],
          [unUUID('S2')]
        )
      ).rejects.toThrow();

      expect(
        busEvenements.nAPasRecuUnEvenement(EvenementServicesDuGroupeModifies)
      ).toBe(true);
    });

    it("jette une erreur si un des services n'est pas accessible à l'utilisateur", async () => {
      const depot = unDepot();
      const groupe = await depot.nouveauGroupe(idUtilisateur, 'Métier');

      await expect(
        depot.associeServicesAuxGroupes(
          idUtilisateur,
          [groupe.donnees().id],
          [unUUID('S2')]
        )
      ).rejects.toThrow(new ErreurServiceInexistant());
    });

    it("jette une erreur si un des groupes n'appartient pas à l'utilisateur", async () => {
      const depot = unDepot();

      await expect(
        depot.associeServicesAuxGroupes(
          idUtilisateur,
          [unUUIDRandom()],
          [idService]
        )
      ).rejects.toThrow(new ErreurGroupeServicesInexistant());
    });
  });
});

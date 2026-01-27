import { AdaptateurProfilAnssi } from '@lab-anssi/lib';
import { ServiceAnnuaire } from '../annuaire/serviceAnnuaire.interface.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import Utilisateur from '../modeles/utilisateur.js';

export type ProfilProConnect = {
  nom: string;
  prenom: string;
  email: string;
  siret?: string;
};

type DonneesUtilisateur = {
  nom: string;
  prenom: string;
  email: string;
  organisation?: {
    nom: string;
    departement: string;
    siret: string;
  };
};

const recupereDonneesUtilisateur = async ({
  adaptateurProfilAnssi,
  profilProConnect,
  serviceAnnuaire,
}: {
  adaptateurProfilAnssi: AdaptateurProfilAnssi;
  profilProConnect: ProfilProConnect;
  serviceAnnuaire: ServiceAnnuaire;
}): Promise<DonneesUtilisateur> => {
  const profilAnssi: DonneesUtilisateur = await adaptateurProfilAnssi.recupere(
    profilProConnect.email
  );
  let donnees: DonneesUtilisateur = profilAnssi;

  if (!profilAnssi) {
    let organisation;
    if (profilProConnect.siret) {
      const organisationTrouvee = (
        await serviceAnnuaire.rechercheOrganisations(profilProConnect.siret)
      )[0];
      organisation = organisationTrouvee && {
        ...organisationTrouvee,
        siret: profilProConnect.siret,
      };
    }

    donnees = {
      nom: profilProConnect.nom,
      prenom: profilProConnect.prenom,
      email: profilProConnect.email,
      ...(organisation && { organisation }),
    };
  }

  return donnees;
};

type OrdreRedirection = {
  type: 'redirection';
  cible: '/creation-compte';
  donnees: DonneesUtilisateur;
};

type OrdreRendu = {
  type: 'rendu';
  cible: 'apresAuthentification';
  donnees?: DonneesUtilisateur & { invite?: true };
  utilisateurAConnecter: Utilisateur;
};

export type OrdreApresAuthentification = OrdreRedirection | OrdreRendu;

const serviceApresAuthentification = async ({
  adaptateurProfilAnssi,
  serviceAnnuaire,
  profilProConnect,
  depotDonnees,
}: {
  adaptateurProfilAnssi: AdaptateurProfilAnssi;
  serviceAnnuaire: ServiceAnnuaire;
  profilProConnect: ProfilProConnect;
  depotDonnees: DepotDonnees;
}): Promise<OrdreApresAuthentification> => {
  const utilisateur = await depotDonnees.utilisateurAvecEmail(
    profilProConnect.email
  );

  if (!utilisateur) {
    return {
      type: 'redirection',
      cible: '/creation-compte',
      donnees: await recupereDonneesUtilisateur({
        adaptateurProfilAnssi,
        profilProConnect,
        serviceAnnuaire,
      }),
    };
  }

  if (utilisateur.estUnInvite()) {
    const donneesUtilisateur = await recupereDonneesUtilisateur({
      adaptateurProfilAnssi,
      profilProConnect,
      serviceAnnuaire,
    });
    return {
      type: 'rendu',
      cible: 'apresAuthentification',
      donnees: { ...donneesUtilisateur, invite: true },
      utilisateurAConnecter: utilisateur,
    };
  }

  await depotDonnees.rafraichisProfilUtilisateurLocal(utilisateur.id);

  const utilisateurAJour = (await depotDonnees.utilisateur(
    utilisateur.id
  )) as Utilisateur;
  if (!utilisateurAJour.aLesInformationsAgentConnect()) {
    await depotDonnees.metsAJourUtilisateur(utilisateur.id, {
      nom: profilProConnect.nom,
      prenom: profilProConnect.prenom,
      entite: { siret: profilProConnect.siret },
    });
  }

  return {
    type: 'rendu',
    cible: 'apresAuthentification',
    utilisateurAConnecter: utilisateur,
  };
};

export { serviceApresAuthentification };

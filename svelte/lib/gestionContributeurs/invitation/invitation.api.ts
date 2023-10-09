import type {
  Permission,
  Rubrique,
  Service,
  Utilisateur,
} from '../gestionContributeurs.d';

export const rechercheContributeurs = async (recherche: string) => {
  const reponse = await axios.get('/api/annuaire/contributeurs', {
    params: { recherche },
  });

  return reponse.data.suggestions;
};

type Invitation = {
  utilisateur: Utilisateur;
  droits: Record<Rubrique, Permission>;
};

export const envoieInvitations = async (
  invitations: Invitation[],
  services: Service[]
) => {
  await Promise.all(
    invitations.map((i) =>
      axios.post('/api/autorisation', {
        emailContributeur: i.utilisateur.email,
        droits: i.droits,
        idServices: services.map((s) => s.id),
      })
    )
  );
};

import Dossier from '../dossier.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { DonneesEtapeAvis } from '../etapes/etapeAvis.js';

export type AvisDUnMembre = {
  membres: string;
  avis: string;
  duree: string;
  commentaire: string;
};

export const avisDesMembres = (
  dossier: Dossier,
  referentiel: TousReferentiels
): AvisDUnMembre[] => {
  const statuts = referentiel.statutsAvisDossierHomologation();
  return ((dossier.avis.toJSON() as DonneesEtapeAvis).avis ?? []).map(
    ({ collaborateurs = [], statut, dureeValidite, commentaires }) => ({
      membres: collaborateurs.join(', '),
      avis: (statut && statuts[statut]?.description) ?? '',
      duree:
        (dureeValidite &&
          referentiel.descriptionEcheanceRenouvellement(dureeValidite)) ??
        '',
      commentaire: commentaires ?? '',
    })
  );
};

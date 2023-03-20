import { modifieParametresAvecItemsExtraits } from './parametres.mjs';

const integreCollaborateursDansAvis = (avis = []) => avis.map((unAvis) => {
  if (!unAvis.prenomNom) {
    return unAvis;
  }
  unAvis.collaborateurs = [unAvis.prenomNom];
  delete unAvis.prenomNom;
  return unAvis;
});

const arrangeParametresAvis = (params) => {
  modifieParametresAvecItemsExtraits(
    params, 'avis', '^(prenomNom|statut|dureeValidite|commentaires)-un-avis-'
  );

  params.avis = integreCollaborateursDansAvis(params.avis);

  return params;
};

export default arrangeParametresAvis;

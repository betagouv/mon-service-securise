import { routeurStore } from '../../store/routeur.store';

export const navigation = {
  versEtape: (idService: string, etape: string) => {
    routeurStore.navigue(
      `/service/${idService}/homologation/edition/etape/${etape}`
    );
  },
  versDossiers: (idService: string) => {
    routeurStore.navigue(`/service/${idService}/dossiers`);
  },
  versDossiersApresFinalisation: (
    idService: string,
    avecDecisionRefusee: boolean
  ) => {
    routeurStore.navigue(
      `/service/${idService}/dossiers?${avecDecisionRefusee ? 'tab=refusees' : 'succesHomologation=true&tab=actif'}`
    );
  },
};

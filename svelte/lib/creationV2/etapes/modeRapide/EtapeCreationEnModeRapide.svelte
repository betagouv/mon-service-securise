<script lang="ts">
  import BrouillonDeServiceEditable from '../BrouillonDeServiceEditable.svelte';
  import { brouillonEstCompletStore } from '../brouillonEstComplet.store';
  import {
    creeBrouillonService,
    metsAJourBrouillonService,
    type MiseAJour,
  } from '../../creationV2.api';
  import { entiteDeUtilisateur, leBrouillon } from '../brouillon.store';
  import { ajouteParametreAUrl } from '../../../outils/url';

  export let estComplete: boolean;
  $: estComplete = $brouillonEstCompletStore;

  const enregistre = async (maj: MiseAJour) => {
    const doitCreerLeBrouillon = !$leBrouillon.id && maj.nomService;
    if (doitCreerLeBrouillon) {
      const nom = maj.nomService as string;
      const idBrouillon = await creeBrouillonService(nom);
      ajouteParametreAUrl('id', idBrouillon);

      let siret = $entiteDeUtilisateur ? $entiteDeUtilisateur.siret : '';
      if (siret) await metsAJourBrouillonService(idBrouillon, { siret });

      leBrouillon.chargeDonnees({ id: idBrouillon, nomService: nom, siret });

      return;
    }

    await metsAJourBrouillonService($leBrouillon.id!, maj);
  };
</script>

<BrouillonDeServiceEditable
  on:champModifie={async (e) => {
    await enregistre(e.detail);
  }}
/>

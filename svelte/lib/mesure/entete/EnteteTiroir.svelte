<script lang="ts">
  import type { MesureAEditer } from '../mesure.d';

  export let mesureAEditer: MesureAEditer | null = null;

  let contenuTexte: string;
  if (!mesureAEditer) {
    contenuTexte = 'Ajoutée';
  } else {
    if (mesureAEditer.typeMesure === 'SPECIFIQUE') contenuTexte = 'Nouvelle';
    else {
      if (mesureAEditer.indispensable) contenuTexte = 'Indispensable';
      else contenuTexte = 'Recommandée';
    }
  }
</script>

<p class="referentiel">{contenuTexte}</p>

<style>
  p {
    padding: 4px 10px;
    font-size: 0.6em;
    font-weight: 500;
    color: #08416a;
    border-radius: 40px;
    background: #ffffff;
    width: fit-content;
    margin-top: 0;
  }
</style>

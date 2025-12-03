<script lang="ts">
  import type { ActionRecommandee } from '../tableauDeBord.d';
  import Lien from '../../ui/Lien.svelte';
  import Bouton from '../../ui/Bouton.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import TiroirGestionContributeurs from '../../ui/tiroirs/TiroirGestionContributeurs.svelte';
  import type { Service } from '../tableauDeBord.d';

  export let action: ActionRecommandee;
  export let service: Service;

  const idService = service.id;
</script>

{#if action.id === 'mettreAJour'}
  <Lien
    inactif={!action.autorisee}
    titre="Finaliser la description"
    type="bouton-secondaire"
    href="/service/{idService}"
    taille="petit"
    icone="editer"
    classe="mettreAJour"
  />
{:else if action.id === 'continuerHomologation'}
  <Lien
    inactif={!action.autorisee}
    titre="Continuer l'homologation"
    type="bouton-secondaire"
    href="/service/{idService}/homologation/edition/etape/recapitulatif"
    taille="petit"
    icone="homologation"
    classe="continuerHomologation"
  />
{:else if action.id === 'augmenterIndiceCyber'}
  <Lien
    inactif={!action.autorisee}
    titre="Augmenter l’indice cyber"
    type="bouton-secondaire"
    href="/service/{idService}/mesures"
    taille="petit"
    icone="indiceCyber"
    classe="augmenterIndiceCyber"
  />
{:else if action.id === 'telechargerEncartHomologation'}
  <Lien
    inactif={!action.autorisee}
    titre="Télécharger l'encart"
    type="bouton-secondaire"
    href="/service/{idService}/dossiers?succesHomologation"
    taille="petit"
    icone="telecharger"
    classe="telechargerEncartHomologation"
  />
{:else if action.id === 'homologuerANouveau'}
  <Lien
    inactif={!action.autorisee}
    titre="Homologuer à nouveau"
    type="bouton-secondaire"
    href="/service/{idService}/dossiers"
    taille="petit"
    icone="medaille"
    classe="homologuerANouveau"
  />
{:else if action.id === 'homologuerService'}
  <Lien
    inactif={!action.autorisee}
    titre="Homologuer le service"
    type="bouton-secondaire"
    href="/service/{idService}/dossiers"
    taille="petit"
    icone="medaille"
    classe="homologuerService"
  />
{:else if action.id === 'inviterContributeur'}
  <Bouton
    actif={action.autorisee}
    titre="Inviter un contributeur"
    type="secondaire"
    taille="petit"
    icone="inviter"
    classe="inviterContributeur"
    on:click={() =>
      tiroirStore.afficheContenu(TiroirGestionContributeurs, {
        services: [service],
      })}
  />
{:else if action.id === 'simulerReferentielV2'}
  <Lien
    inactif={!action.autorisee}
    titre="Simuler le référentiel 2025"
    type="bouton-secondaire"
    href="/service/{idService}/simulation-referentiel-v2"
    taille="petit"
    icone="redemarrer"
    classe="simulerReferentielV2"
  />
{/if}

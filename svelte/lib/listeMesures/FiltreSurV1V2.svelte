<script lang="ts">
  import type { VersionService } from '../../../src/modeles/versionService';

  interface Props {
    value: VersionService;
  }

  let { value = $bindable() }: Props = $props();

  const selectionneVersion = (version: string) => {
    value = version as VersionService;
  };
</script>

<th colspan="3">
  <div>
    <label for="version-v2" class:actif={value === 'v2'}>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        titre="Nouveau référentiel"
        variante={value === 'v2' ? 'secondaire' : 'tertiaire'}
        taille="sm"
        icone=""
        positionIcone="sans"
        id="version-v2"
        onclick={() => selectionneVersion('v2')}
      ></lab-anssi-bouton>
    </label>
    <label for="version-v1" class:actif={value === 'v1'}>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        titre="Ancien référentiel"
        variante={value === 'v1' ? 'secondaire' : 'tertiaire'}
        taille="sm"
        icone=""
        positionIcone="sans"
        id="version-v1"
        onclick={() => selectionneVersion('v1')}
      ></lab-anssi-bouton>
    </label>
  </div>
</th>

<style lang="scss">
  th {
    padding: 12px;
    color: var(--bleu-mise-en-avant);
    border-bottom: 1px solid #dddddd;

    div {
      display: flex;

      label {
        cursor: pointer;

        &.actif {
          z-index: 1;
        }
      }

      label[for='version-v1'] {
        margin-left: -4px;
      }
    }
  }
</style>

<script lang="ts">
  import AssistantServiceV2 from './AssistantServiceV2.svelte';
  import type { Entite } from '../ui/types';

  export let entite: Entite | undefined;
</script>

<AssistantServiceV2 {entite} />

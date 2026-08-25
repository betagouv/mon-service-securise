<script lang="ts">
  import type { PreferencesProps } from './preferences.types';

  let {
    infolettreAcceptee,
    pixelDeSuiviAccepte,
    transactionnelAccepte,
  }: PreferencesProps = $props();
</script>

<h1>Préférences</h1>

<pre>{transactionnelAccepte}</pre>
<pre>{pixelDeSuiviAccepte}</pre>
<pre>{infolettreAcceptee}</pre>

<style lang="scss">
</style>

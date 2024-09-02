<script lang="ts">
  export let echeance: Date;
  const echeanceFormattee = new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(echeance);
</script>

<span class="dateEcheance">
  {echeanceFormattee}
</span>

<style>
  .dateEcheance::before {
    content: '';
    width: 24px;
    height: 24px;
    background: url('/statique/assets/images/icone_calendrier_sans_loupe.svg')
      no-repeat;
    position: relative;
    left: -2px;
    top: 6px;
    display: inline-block;
  }

  .dateEcheance {
    display: inline-block;
  }
</style>

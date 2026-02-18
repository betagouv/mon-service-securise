<script lang="ts">
  export let porteursSinguliers: string[];
</script>

<div class="porteurs-singuliers">
  <span class="titre"><b>Responsable indicatif</b></span>
  <span class="sous-titre">
    Le rôle indiqué est proposé à titre indicatif. Chaque équipe reste libre de
    définir son propre responsable.
  </span>
  <span class="contenu">{porteursSinguliers.join(', ')}</span>
</div>

<style lang="scss">
  .porteurs-singuliers {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .titre {
      font-size: 1rem;
      line-height: 1.5rem;
      color: #282828;
    }

    .sous-titre {
      font-size: 0.75rem;
      line-height: 1.25rem;
      margin-bottom: 4px;
      color: #666666;
    }

    .contenu {
      font-size: 1rem;
      line-height: 1.375rem;
      margin-bottom: 32px;
      color: #000;
    }
  }
</style>

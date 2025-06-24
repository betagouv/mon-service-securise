<script lang="ts">
  export let etapeCourante: number;

  const nbEtapes = 3;
  const etapes = [
    'Mettre à jour le statut et/ou la précision',
    'Sélectionner les services à modifier',
    'Résumé des modifications',
  ];
</script>

<div class="etapier">
  <span class="avancement">Étape {etapeCourante} sur {nbEtapes}</span>
  <h3>{etapes[etapeCourante - 1]}</h3>
  <div class="indicateurs-etape">
    {#each new Array(nbEtapes)
      .fill(0)
      .map((_, index) => (index + 1 <= etapeCourante ? 'actif' : '')) as actif}
      <div class="indicateur-etape {actif}" />
    {/each}
  </div>
  {#if etapes[etapeCourante]}
    <span class="etape-suivante"
      ><b>Étape suivante :</b> {etapes[etapeCourante]}</span
    >
  {/if}
</div>

<style lang="scss">
  .etapier {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .avancement {
      color: #3a3a3a;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5rem;
    }

    h3 {
      color: #161616;
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.75rem;
      margin: 0;
    }

    .indicateurs-etape {
      display: flex;
      flex-direction: row;
      gap: 8px;
      margin: 8px 0;

      .indicateur-etape {
        height: 8px;
        width: 190px;
        background: #eeeeee;

        &.actif {
          background: var(--bleu-mise-en-avant);
        }
      }
    }

    .etape-suivante {
      color: #666;
      font-size: 0.75rem;
      font-style: normal;
      font-weight: 400;
      line-height: 1.25rem;
    }
  }
</style>

<script lang="ts">
</script>

<div class="etat-vide">
  <img
    src="/statique/assets/images/illustration_recherche_vide.svg"
    alt=""
    width="128"
    height="128"
  />
  <div class="contenu">
    <h3>Aucun admin ajouté à cette entité</h3>
    <p>
      Ajoutez un premier admin pour déléguer la gestion et le suivi de vos
      entités.
    </p>
  </div>
</div>

<style lang="scss">
  .etat-vide {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding-bottom: 8px;
    text-align: center;
    margin-top: 2rem;

    .contenu {
      display: flex;
      flex-direction: column;
      gap: 8px;

      h3 {
        font-size: 1.5rem;
        line-height: 2rem;
        font-weight: 700;
        color: #161616;
        margin: 0;
      }

      p {
        font-size: 1.125rem;
        line-height: 1.75rem;
        color: #3a3a3a;
        margin: 0;
      }
    }
  }
</style>

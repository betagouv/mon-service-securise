<div class="legende-matrice">
  <ul>
    <li class="faible">
      <span class="niveau">Faible :&nbsp;</span>Acceptable en l’état
    </li>
    <li class="moyen">
      <span class="niveau">Moyen :&nbsp;</span>Tolérable sous contrôle
    </li>
    <li class="eleve"><span class="niveau">Élevé :&nbsp;</span>Inacceptable</li>
  </ul>
</div>

<style>
  .legende-matrice {
    margin-top: 32px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 12px;
  }

  li {
    font-size: 0.813rem;
    line-height: 1.125rem;
    display: flex;
    align-items: center;
  }

  li:before {
    content: '';
    display: inline-block;
    width: 15px;
    height: 15px;
    background-color: var(--couleur-fond);
    border-radius: 4px;
  }

  li.faible:before {
    --couleur-fond: #4cb963;
  }

  li.moyen:before {
    --couleur-fond: #faa72c;
  }

  li.eleve:before {
    --couleur-fond: #e32630;
  }

  .niveau {
    margin-left: 4px;
    font-weight: bold;
  }
</style>

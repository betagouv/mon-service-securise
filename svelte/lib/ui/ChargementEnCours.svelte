<span class="icone">
  <span class="barres">
    <span class="barre barre-1" />
    <span class="barre barre-2" />
    <span class="barre barre-3" />
  </span>
  <span class="pulse" />
  <span class="barre-chargement" />
</span>

<style>
  .icone {
    width: 74px;
    height: 74px;
    background: #0079d0;
    border-radius: 50%;
    position: relative;
    display: inline-block;
  }

  .pulse {
    width: 74px;
    height: 74px;
    border-radius: 50%;
    border: 2px solid #dbeeff;
    background: none;
    animation: pulse 2s infinite ease-out;
    transform-origin: center;
    position: absolute;
    top: 0;
    left: 0;
  }

  @keyframes pulse {
    0% {
      transform: translate(-2px, -2px) scale(1.8);
      opacity: 1;
    }
    100% {
      transform: translate(-2px, -2px) scale(3);
      opacity: 0;
    }
  }

  .barre-chargement {
    width: 134px;
    height: 134px;
    border: 5px solid #0079d04d;
    border-bottom-color: #0079d0;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 2s linear infinite;
    position: absolute;
    top: -30px;
    left: -30px;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .barres {
    display: flex;
    flex-direction: row;
    gap: 3px;
    position: absolute;
    top: 25px;
    left: 24px;
  }

  .barre {
    background: white;
    border-radius: 1px;
    width: 6px;
    height: 23px;
    animation: bar-grow 1s ease-in-out infinite;
    transform-origin: 0 100%;
    animation-direction: alternate;
  }

  .barre-2 {
    animation-delay: 0.3s;
  }

  .barre-3 {
    animation-delay: 0.6s;
  }

  @keyframes bar-grow {
    0% {
      transform: scaleY(100%);
    }
    100% {
      transform: scaleY(10%);
    }
  }
</style>

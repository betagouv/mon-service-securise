const brancheComportementModaleNouvelleFonctionnalite = ($modale) => {
  const populePagination = (nombrePage) => {
    const $conteneur = $('.pagination', $modale);
    $conteneur.empty();
    for (let i = 1; i <= nombrePage; i += 1) {
      let classe = 'rond';
      if (i === 1) classe += ' actif';
      const rond = $(`<div class="${classe}" data-numero-page="${i}"></div>`);
      rond.on('click', () => {
        $modale.attr('data-page-actuelle', i);
      });
      $conteneur.append(rond);
    }
  };

  const brancheComportementsInteractions = () => {
    const supprimeQueryString = () => {
      const url = window.location.href.replace(window.location.search, '');
      window.history.pushState({}, null, url);
    };

    $('.bouton-fermeture', $modale).on('click', () => {
      $modale[0].close();
    });

    $($modale).on('close', () => {
      supprimeQueryString();
      $modale.attr('data-page-actuelle', 1);
    });

    $('.bouton.suivant', $modale).on('click', () => {
      const actuelle = parseInt($modale.attr('data-page-actuelle'), 10);
      const nouvelle = actuelle + 1;
      $modale.attr('data-page-actuelle', nouvelle);
    });

    $('.bouton.precedent', $modale).on('click', () => {
      const actuelle = parseInt($modale.attr('data-page-actuelle'), 10);
      const nouvelle = actuelle - 1;
      $modale.attr('data-page-actuelle', nouvelle);
    });

    const observeurChangementDePage = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-page-actuelle'
        ) {
          const nouvellePage = $modale.attr('data-page-actuelle');
          $('.page').hide();
          $(`.page[data-numero-page='${nouvellePage}']`).show();
          $('.rond').removeClass('actif');
          $(`.rond[data-numero-page="${nouvellePage}"]`).addClass('actif');
        }
      });
    });

    observeurChangementDePage.observe($modale[0], { attributes: true });
  };

  const montreNouvelleFonctionnaliteSiNecessaire = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idNouvelleFonctionnalite = urlParams.get('nouvelleFonctionnalite');

    if (idNouvelleFonctionnalite) {
      axios
        .get(`/api/nouvelleFonctionnalite/${idNouvelleFonctionnalite}`)
        .then((reponse) => {
          $('.conteneur-nouvelle-fonctionnalite', $modale).html(reponse.data);
          brancheComportementsInteractions();
          populePagination($('.page').length);
          $modale[0].showModal();
        });
    }
  };

  const brancheComportementBoutonNouveautes = () => {
    const ajouteIdDansURL = () =>
      axios.get(`/api/nouvelleFonctionnalite/derniere`).then((reponse) => {
        const idDerniereFonctionnalite = reponse.data.id;
        const parametresUrl = new URLSearchParams(window.location.search);
        parametresUrl.set('nouvelleFonctionnalite', idDerniereFonctionnalite);
        const nouvelleUrl = `${window.location.origin}${window.location.pathname}?${parametresUrl}`;
        window.history.replaceState({}, null, nouvelleUrl);
      });

    $('.bandeau-nouveautes').on('click', () => {
      ajouteIdDansURL().then(() => {
        montreNouvelleFonctionnaliteSiNecessaire();
      });
    });
  };

  montreNouvelleFonctionnaliteSiNecessaire();
  brancheComportementBoutonNouveautes();
};

export default brancheComportementModaleNouvelleFonctionnalite;

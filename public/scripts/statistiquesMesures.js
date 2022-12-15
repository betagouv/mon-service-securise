const PALETTE = {
  BLANC: '#fff',
  BLEU_MOYEN: '#75a1e8',
  BLEU_CLAIR: '#e4efff',
  BLEU_FONCE: '#0a4c8c',
  BLEU_MISE_EN_AVANT: '#0f7ac7',
};

const dessineCamembert = ($canevas, {
  totalMesures = 0,
  mesuresEnCours = 0,
  mesuresNonFaites = 0,
  mesuresFaites = 0,
}) => {
  const mesuresARemplir = totalMesures - mesuresEnCours - mesuresNonFaites - mesuresFaites;
  const donnees = [mesuresEnCours, mesuresNonFaites, mesuresARemplir, mesuresFaites];
  const encoreMesuresAFaire = mesuresEnCours > 0 || mesuresNonFaites > 0 || mesuresARemplir > 0;
  const decalageMesuresFaites = encoreMesuresAFaire ? 20 : 0;
  const decalageLabelMesuresFaites = encoreMesuresAFaire ? -20 : 15;

  /* eslint-disable no-new */
  new Chart(
    $canevas[0],
    {
      type: 'pie',
      plugins: [ChartDataLabels],
      options: {
        animation: false,
        borderWidth: 0,
        interaction: false,
        plugins: {
          tooltip: false,
          legend: { display: false },
        },
      },
      data: {
        datasets: [
          {
            data: donnees,
            cutout: '90%',
            radius: '85%',
            backgroundColor: [
              PALETTE.BLEU_MISE_EN_AVANT,
              PALETTE.BLEU_MISE_EN_AVANT,
              PALETTE.BLEU_MISE_EN_AVANT,
              'transparent',
            ],
            datalabels: { display: false },
          },
          {
            data: donnees,
            offset: [0, 0, 0, decalageMesuresFaites],
            radius: '180%',
            backgroundColor: [
              PALETTE.BLEU_MOYEN,
              PALETTE.BLEU_CLAIR,
              PALETTE.BLANC,
              PALETTE.BLEU_FONCE,
            ],
            datalabels: {
              color: [PALETTE.BLANC, PALETTE.BLEU_FONCE, PALETTE.BLEU_FONCE, PALETTE.BLANC],
              font: { weight: 'bold' },
              align: 'start',
              offset: [-15, -15, -15, decalageLabelMesuresFaites],
              formatter: (valeur) => (valeur || ''),
            },
          },
        ],
      },
    }
  );
  /* eslint-enable no-new */
};

const dessineStatistiquesMesures = ($canevas) => {
  const statistiquesMesures = {
    totalMesures: $canevas.data('total-mesures'),
    mesuresEnCours: $canevas.data('mesures-en-cours'),
    mesuresNonFaites: $canevas.data('mesures-non-faites'),
    mesuresFaites: $canevas.data('mesures-faites'),
  };

  dessineCamembert($canevas, statistiquesMesures);
};

$(() => {
  dessineStatistiquesMesures($('canvas#mesures-indispensables'));
  dessineStatistiquesMesures($('canvas#mesures-recommandees'));
});

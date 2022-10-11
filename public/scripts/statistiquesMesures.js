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
            offset: [0, 0, 0, 20],
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
              offset: [-15, -15, -15, -20],
              formatter: (valeur) => (valeur || ''),
            },
          },
        ],
      },
    }
  );
  /* eslint-enable no-new */
};

$(() => {
  const $canevasMesuresIndispensables = $('canvas#mesures-indispensables');
  const statistiquesMesuresIndispensables = {
    totalMesures: $canevasMesuresIndispensables.data('total-mesures'),
    mesuresEnCours: $canevasMesuresIndispensables.data('mesures-en-cours'),
    mesuresNonFaites: $canevasMesuresIndispensables.data('mesures-non-faites'),
    mesuresFaites: $canevasMesuresIndispensables.data('mesures-faites'),
  };

  dessineCamembert($canevasMesuresIndispensables, statistiquesMesuresIndispensables);
});

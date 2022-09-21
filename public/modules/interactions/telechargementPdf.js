/* eslint new-cap: ['error', { properties: false }] */

const telechargementPdf = (nomDocumentPdfCible) => () => {
  const doc = new jspdf.jsPDF('p', 'mm', 'a4');

  const ajoutePageAvecImage = (canvas) => {
    const img = canvas.toDataURL('image/jpeg');
    doc.addPage();
    doc.addImage(img, 'JPEG', 10, 10, 190, 190 * (canvas.height / canvas.width));
  };

  const construisPDF = $.map($('.page'), ($p) => $p)
    .reduce((acc, $page) => (
      acc.then(() => html2canvas($page, { logging: false }).then(ajoutePageAvecImage))
    ), Promise.resolve());

  construisPDF.then(() => {
    doc.deletePage(1);
    doc.save(nomDocumentPdfCible);
  });
};

export default telechargementPdf;

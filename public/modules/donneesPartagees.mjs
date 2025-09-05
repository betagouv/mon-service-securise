const lisDonneesPartagees = (id) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = $(`#${id}`).text();
  return JSON.parse(txt.value);
};
export default lisDonneesPartagees;

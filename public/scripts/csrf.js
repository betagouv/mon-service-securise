$(() => {
  const $infos = $('#infos-csrf');
  const { token } = JSON.parse($infos.text());
  axios.defaults.headers.common['X-CSRF-Token'] = token;
});

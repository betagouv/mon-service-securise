document.addEventListener('DOMContentLoaded', () => {
  const { urlRedirection } = JSON.parse(
    document.getElementById('url-redirection').innerText
  );
  window.location = urlRedirection ?? '/tableauDeBord';
});

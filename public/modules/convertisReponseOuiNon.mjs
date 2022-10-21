const convertisReponseOuiNon = (valeur) => {
  switch (valeur) {
    case 'oui': return true;
    case 'non': return false;
    default: return undefined;
  }
};

export default convertisReponseOuiNon;

export const acquitteSuggestionBesoinsSecuriteRetrogrades = async (
  idService: string
) => {
  await axios.put(
    `/api/service/${idService}/suggestionAction/controleBesoinsDeSecuriteRetrogrades`
  );
};

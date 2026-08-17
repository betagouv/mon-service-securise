export const termineVisiteGuidee = async () => {
  await axios.post(`/api/visiteGuidee/termine`);
};

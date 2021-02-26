export const getCovidData = () => {
  fetch('https://covid.ourworldindata.org/data/owid-covid-data.json')
    .then(res => res.json())
    .then((data) => {
      return data.ok ? data : {}
    });
};
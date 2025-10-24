const BASE_URL = './data/movie.json';

let fetchAPI = () => {
    axios({
      url : BASE_URL,
      method : "GET",
    })
    .then((res) => {
      let list = res.data;
      console.log(list);
    })
    .catch((err) => {
      console.log(err);
    });
};

fetchAPI();
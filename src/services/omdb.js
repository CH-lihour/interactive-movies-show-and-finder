import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_OMDB_BASE_URL,
  params: { apikey: import.meta.env.VITE_OMDB_KEY },
});

export function searchMovies(query, page = 1) {
  return api.get("/", { params: { s: query, page } }).then((res) => res.data);
}

export function getMovieDetails(id) {
  return api.get("/", { params: { i: id, plot: "full" } }).then((res) => res.data);
}

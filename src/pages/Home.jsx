import { useState } from "react";
import { Link } from "react-router-dom";
import { searchMovies } from "../services/omdb";

export default function Home() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const data = await searchMovies(query);
      if (data.Response === "False") {
        setMovies([]);
        setError(data.Error || "No results found.");
      } else {
        setMovies(data.Search || []);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="hero">
        <h1>
          Find your next <span className="accent">movie</span>
        </h1>
        <p>Search thousands of films and dive into the details.</p>

        <form className="search" onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies…"
          />
          <button type="submit">Search</button>
        </form>
      </section>

      {loading && (
        <div className="state">
          <div className="spinner" />
          Searching…
        </div>
      )}

      {!loading && error && <div className="state">{error}</div>}

      {!loading && !error && !searched && (
        <div className="state">Start typing to discover movies.</div>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="results">
          {movies.map((movie) => (
            <Link
              key={movie.imdbID}
              to={`/movie/${movie.imdbID}`}
              className="movie-card"
            >
              {movie.Poster && movie.Poster !== "N/A" ? (
                <img
                  className="movie-card__poster"
                  src={movie.Poster}
                  alt={movie.Title}
                  loading="lazy"
                />
              ) : (
                <div className="movie-card__poster movie-card__poster--empty">
                  No poster
                </div>
              )}
              <div className="movie-card__body">
                <h3>{movie.Title}</h3>
                <span className="year">{movie.Year}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

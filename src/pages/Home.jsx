import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchMovies } from "../services/omdb";

export default function Home() {
  const DEFAULT_QUERY = "marvel";
  const DEBOUNCE_MS = 500;
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // the effect below does the fetching; just stop the page reloading on Enter
  function handleSearch(e) {
    e.preventDefault();
  }

  // debounced search — also covers the first open via DEFAULT_QUERY
  useEffect(() => {
    const term = query.trim() || DEFAULT_QUERY;
    let ignore = false;
    setLoading(true);

    const timer = setTimeout(
      async () => {
        setError("");

        try {
          const data = await searchMovies(term);
          if (ignore) return;
          setMovies(data.Search || []);
        } catch (err) {
          if (ignore) return;
          setMovies([]);
          setError(err.message);
        } finally {
          if (!ignore) setLoading(false);
        }
      },
      query ? DEBOUNCE_MS : 0,
    );

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

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

      {!loading && !error && movies.length === 0 && (
        <div className="state">No movies found.</div>
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

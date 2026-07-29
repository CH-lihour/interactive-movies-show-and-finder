import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieDetails } from "../services/omdb";

// OMDb fills unknown fields with the literal string "N/A"
const present = (value) => value && value !== "N/A";

// "Action, Adventure, Sci-Fi" -> ["Action", "Adventure", "Sci-Fi"]
const splitList = (value) =>
  present(value) ? value.split(",").map((s) => s.trim()) : [];

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // re-runs whenever the URL param changes, not just on mount
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    setLoading(true);
    setError("");

    (async () => {
      try {
        const data = await getMovieDetails(id, { signal: controller.signal });
        if (ignore) return;
        setMovie(data);
      } catch (err) {
        if (ignore) return; // also swallows the abort, which only fires from cleanup
        setMovie(null);
        setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [id]);

  const genres = splitList(movie?.Genre);
  const cast = splitList(movie?.Actors);

  return (
    <div className="details">
      <Link to="/" className="details__back">
        ← Back to search
      </Link>

      {loading && (
        <div className="state">
          <div className="spinner" />
          Loading details…
        </div>
      )}

      {!loading && error && <div className="state">{error}</div>}

      {!loading && !error && movie && (
        <div className="details__layout">
          {present(movie.Poster) ? (
            <img
              className="details__poster"
              src={movie.Poster}
              alt={movie.Title}
            />
          ) : (
            <div className="details__poster details__poster--empty">
              No poster
            </div>
          )}

          <div className="details__info">
            <h1>{movie.Title}</h1>

            <div className="details__meta">
              {present(movie.Year) && <span>{movie.Year}</span>}
              {present(movie.Runtime) && <span>{movie.Runtime}</span>}
              {present(movie.Rated) && <span>{movie.Rated}</span>}
              {present(movie.imdbRating) && (
                <span className="details__rating">★ {movie.imdbRating}/10</span>
              )}
            </div>

            {genres.length > 0 && (
              <ul className="details__genres">
                {genres.map((genre) => (
                  <li key={genre}>{genre}</li>
                ))}
              </ul>
            )}

            {present(movie.Plot) && (
              <p className="details__plot">{movie.Plot}</p>
            )}

            <dl className="details__facts">
              {present(movie.Director) && (
                <>
                  <dt>Director</dt>
                  <dd>{movie.Director}</dd>
                </>
              )}
              {cast.length > 0 && (
                <>
                  <dt>Cast</dt>
                  <dd>{cast.join(", ")}</dd>
                </>
              )}
              {present(movie.Released) && (
                <>
                  <dt>Released</dt>
                  <dd>{movie.Released}</dd>
                </>
              )}
              {present(movie.Language) && (
                <>
                  <dt>Language</dt>
                  <dd>{movie.Language}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

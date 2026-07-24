import { useParams, Link } from "react-router-dom";

export default function MovieDetails() {
  const { id } = useParams();
  return (
    <div className="details">
      <Link to="/" className="details__back">
        ← Back to search
      </Link>
      <h1>Movie Details</h1>
      <p>Showing details for movie ID: {id}</p>
    </div>
  );
}

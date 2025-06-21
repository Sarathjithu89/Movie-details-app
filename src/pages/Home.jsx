import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies } from "../services/api";
import "../css/Home.css";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Load and append popular movies
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const data = await getPopularMovies(page);
        setMovies((prev) =>
          page === 1 ? data.results : [...prev, ...data.results]
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load more movies");
      } finally {
        setLoading(false);
      }
    };

    if (!isSearching) loadMovies();
  }, [page, isSearching]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setLoading(true);
    setError(null);

    try {
      const results = await searchMovies(searchQuery);
      setMovies(results);
    } catch (err) {
      console.error(err);
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  // If searchQuery becomes empty, reset to popular movies
  useEffect(() => {
    if (searchQuery === "") {
      setIsSearching(false);
      setPage(1); // Reset to first page of popular movies
    }
  }, [searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (
        !loading &&
        !isSearching &&
        scrollTop + clientHeight + 100 >= scrollHeight
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, isSearching]);

  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for movies"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      <div className="movies-grid">
        {movies && movies.length > 0 ? (
          movies.map((movie) => <MovieCard movie={movie} key={movie.id} />)
        ) : loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <p>No movies found</p>
        )}
      </div>

      {loading && (
        <p style={{ textAlign: "center", margin: "1rem" }}>
          Loading more movies...
        </p>
      )}
    </div>
  );
}

export default Home;

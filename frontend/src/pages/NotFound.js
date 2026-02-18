import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>404</h1>
      <h2>Oops! We can't find that page.</h2>
      <p>
        Sorry, the page you were looking for doesn’t exist.
      </p>
      <Link to="/">
        <button>Go back home</button>
      </Link>
    </div>
  );
}

export default NotFound;

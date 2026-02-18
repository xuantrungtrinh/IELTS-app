import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("https://ielts-app-x5f5.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Invalid email or password");
        return;
      }

      localStorage.setItem("token", data.access_token);

      setSuccess("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);

    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "50px auto" }}>
      <h2>Log in</h2>

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
      {success && <p style={{ color: "green", fontWeight: "bold" }}>{success}</p>}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "12px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ position: "relative", marginBottom: "12px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",                 // 🔹 ADDED
              padding: "8px 35px 8px 8px",    // 🔹 CHANGED
              boxSizing: "border-box"        // 🔹 ADDED
            }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",                 // 🔹 CHANGED
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        <button type="submit">Log in</button>
      </form>
    </div>
  );
}

export default Login;

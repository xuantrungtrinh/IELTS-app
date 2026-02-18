import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("https://ielts-app-x5f5.onrender.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || "Sign up failed");
        return;
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "50px auto" }}>
      <h2>Sign up</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: "12px" }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "6px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordTouched(true)}
            minLength={6}
            required
          />
        </div>

        {/* Password hint logic */}
        {passwordTouched && password.length > 0 && password.length < 6 && (
          <small style={{ color: "red", display: "block", marginBottom: "12px" }}>
            Password must be at least 6 characters.
          </small>
        )}

        {passwordTouched && password.length >= 6 && (
          <small style={{ color: "green", display: "block", marginBottom: "12px" }}>
            Password looks good ✔
          </small>
        )}

        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}

export default Signup;

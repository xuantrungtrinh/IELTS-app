import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // 🔹 CHANGED: Simplified strength logic based only on length
  const getPasswordStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.length >= 12) return "Strong";
    return "Medium"; // 6–11 characters
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    // 🔹 ADDED: Prevent submit if password < 6
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

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
    <div style={{ maxWidth: "320px", margin: "50px auto" }}>
      <h2>Sign up</h2>

      {message && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          {message}
        </p>
      )}

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

        <div style={{ position: "relative", marginBottom: "8px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordTouched(true)}
            minLength={6}
            required
            style={{ paddingRight: "30px" }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer"
            }}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {/* Show rule if < 6 characters */}
        {passwordTouched && password.length > 0 && password.length < 6 && (
          <small style={{ color: "red", display: "block", marginBottom: "8px" }}>
            Password must be at least 6 characters.
          </small>
        )}

        {/* 🔹 CHANGED: Strength now purely based on length */}
        {passwordTouched && password.length >= 6 && (
          <small
            style={{
              display: "block",
              marginBottom: "8px",
              color:
                getPasswordStrength() === "Strong"
                  ? "green"
                  : "orange"
            }}
          >
            Strength: {getPasswordStrength()}
          </small>
        )}

        <div style={{ position: "relative", marginBottom: "12px" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ paddingRight: "30px" }} // 🔹 ADDED
          />

          {/* 🔹 ADDED */}
          <span
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer"
            }}
          >
            {showConfirmPassword ? "🙈" : "👁"}
          </span>
        </div>

        {confirmPassword && password !== confirmPassword && (
          <small style={{ color: "red", display: "block", marginBottom: "12px" }}>
            Passwords do not match
          </small>
        )}

        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}

export default Signup;

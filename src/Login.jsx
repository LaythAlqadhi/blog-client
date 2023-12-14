import React, { useState } from "react";
import { useAuth } from "./AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch("https://blog-restful-api.adaptable.app/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token } = data;
        login(token);
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      throw new Error(`Error during login: ${error}`);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form>
        <label htmlFor="username">
          Username:
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <br />
        <label htmlFor="password">
          Password:
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <button type="button" onClick={handleLogin}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;

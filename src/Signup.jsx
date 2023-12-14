import React, { useState } from "react";

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState(null);
  const [signedUp, setSignedUp] = useState(false);

  const handleSignup = async () => {
    try {
      const response = await fetch("https://blog-restful-api.adaptable.app/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.errors) {
          setErrors(result.errors);
          return;
        }

        setSignedUp(true);
      } else {
        throw new Error("Signup failed");
      }
    } catch (error) {
      throw new Error(`Error during Signup: ${error}`);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {signedUp ? (
        <p>You Signed Up Successfully.</p>
      ) : (
        <form>
          <label htmlFor="firstName">
            First Name:
            <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <br />
          <label htmlFor="lastName">
            Last Name:
            <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>
          <br />
          <label htmlFor="username">
            Username:
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <br />
          <label htmlFor="email">
            Email:
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <br />
          <label htmlFor="password">
            Password:
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <br />
          <label htmlFor="passwordConfirmation">
            Password Confirmation:
            <input
              id="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </label>
          <br />
          {errors && errors.map((error, index) => <p key={index}>{error.msg}</p>)}
          <button type="button" onClick={handleSignup}>
            Sign Up
          </button>
        </form>
      )}
    </div>
  );
}

export default Signup;

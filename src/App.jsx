import React from "react";
import { useAuth } from "./AuthContext";
import PostList from "./PostList";
import Login from "./Login";
import Logout from "./Logout";
import Signup from "./Signup";
import "./App.css";

function App() {
  const { token } = useAuth();

  return (
    <>
      {token ? (
        <Logout />
      ) : (
        <>
          <Login />
          <br />
          <hr />
          <Signup />
        </>
      )}

      {token && <PostList />}
    </>
  );
}

export default App;

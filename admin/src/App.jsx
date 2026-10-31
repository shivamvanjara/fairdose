import { useState, useEffect } from "react";
import { Box, Toolbar, CircularProgress } from "@mui/material";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

import SideBar from "./SideBar";
import TopBar from "./TopBar";
import Dashboard from "./Dashboard";
import Login from "./login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // success → onAuthStateChanged will auto-update user
    } catch (error) {
      console.error("Login Error:", error.code);

      // ✅ CLEAN & CORRECT ERROR MESSAGES
      if (error.code === "auth/user-not-found") {
        alert("User not found");
      } else if (error.code === "auth/wrong-password") {
        alert("Wrong password");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email format");
      } else {
        alert("Login failed. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Box sx={{ display: "flex", bgcolor: "#f5f7fb", minHeight: "100vh" }}>
      <SideBar />
      <TopBar />

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: "100%" }}>
        <Toolbar />
        <Dashboard />
      </Box>
    </Box>
  );
}

export default App;

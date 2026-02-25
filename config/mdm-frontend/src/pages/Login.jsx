import { useState, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import api from "../api/axios";
import { AuthContext } from "../context/Authcontext";

export default function Login() {
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("token/", {
        username,
        password,
      });

      login(res.data.access);
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Identifiants incorrects");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f8",
      }}
    >
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>

          <Box sx={{ textAlign: "center", mb: 2 }}>
            <img src="/logo.png" alt="logo" width="80" />
            <Typography variant="h5" mt={1}>
              LOGIN
            </Typography>
            <Typography variant="body2">
              Système de gestion des données de référence
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nom d'utilisateur"
              fullWidth
              margin="normal"
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              label="Mot de passe"
              type="password"
              fullWidth
              margin="normal"
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              type="submit"
            >
              Se connecter
            </Button>
          </form>

        </CardContent>
      </Card>
    </Box>
  );
}

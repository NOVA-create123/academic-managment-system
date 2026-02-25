import { useEffect, useState } from "react";
import {
  Box, Button, TextField, Typography, MenuItem, Paper,
  Table, TableHead, TableRow, TableCell, TableBody,
  Alert, CircularProgress, IconButton, Stack
} from "@mui/material";
import { Edit, Delete, Cancel, PersonAdd } from "@mui/icons-material";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";

// ... (garder tes imports)

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  
  const [form, setForm] = useState({
    username: "", email: "", password: "", group: "SCOLARITE",
  });

  const fetchUsers = async () => {
    // 1. On ne met PAS loading à true ici si on vient de handleSubmit pour éviter 
    // que le tableau ne disparaisse brusquement (cause du removeChild)
    try {
      const res = await api.get("users/");
      setUsers(res.data);
    } catch (err) {
      setError("Erreur lors de la récupération.");
    }
  };

  // Chargement initial uniquement
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    initialLoad();
  }, []);

  const resetForm = () => {
    setForm({ username: "", email: "", password: "", group: "SCOLARITE" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      // 2. On utilise une alerte ou un petit indicateur local plutôt que de vider toute la page
      if (editId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`users/${editId}/`, payload);
      } else {
        await api.post("users/", form);
      }
      resetForm();
      await fetchUsers(); 
    } catch (err) {
      setError("Erreur lors de l'enregistrement.");
    }
  };

  const handleSupprimer = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await api.delete(`users/${id}/`);
        await fetchUsers();
      } catch (err) {
        setError("Erreur lors de la suppression.");
      }
    }
  };

  const preparerModification = (u) => {
    setEditId(u.id);
    setForm({
      username: u.username,
      email: u.email,
      password: "",
      group: u.groups?.[0] || "SCOLARITE",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h5" mb={3} fontWeight="bold">Gestion des utilisateurs</Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

        <Paper sx={{ p: 3, mb: 4, borderTop: editId ? "4px solid #ed6c02" : "none" }} elevation={2}>
          <Typography variant="h6" gutterBottom>
            {editId ? `Modifier l'utilisateur : ${form.username}` : "Créer un nouvel utilisateur"}
          </Typography>
          {/* 3. handleSubmit est déjà sécurisé avec e.preventDefault() */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField label="Nom d'utilisateur" size="small" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              <TextField label="Email" size="small" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <TextField label={editId ? "Nouveau mot de passe" : "Mot de passe"} size="small" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editId} />
              <TextField select label="Groupe" size="small" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="SCOLARITE">SCOLARITE</MenuItem>
                <MenuItem value="CONSULTATION">CONSULTATION</MenuItem>
              </TextField>
            </Box>
            
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" type="submit" color={editId ? "warning" : "primary"}>
                {editId ? "Mettre à jour" : "Enregistrer"}
              </Button>
              {editId && (
                <Button type="button" variant="outlined" color="inherit" onClick={resetForm} startIcon={<Cancel />}>
                  Annuler
                </Button>
              )}
            </Stack>
          </form>
        </Paper>

        <Paper elevation={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
          ) : (
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><b>Username</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Groupes</b></TableCell>
                  <TableCell><b>Statut</b></TableCell>
                  <TableCell align="right"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              {/* Utilisation d'une clé sur le TableBody pour forcer le rafraîchissement propre du DOM */}
              <TableBody key={users.length}>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{Array.isArray(u.groups) ? u.groups.join(", ") : "Aucun"}</TableCell>
                    <TableCell>
                      <Typography color={u.is_active ? "success.main" : "error.main"} variant="body2">
                        {u.is_active ? "Actif" : "Inactif"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => preparerModification(u)}><Edit fontSize="small" /></IconButton>
                      <IconButton color="error" onClick={() => handleSupprimer(u.id)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
}

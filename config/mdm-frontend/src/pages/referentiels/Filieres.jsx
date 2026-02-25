import { useEffect, useState, useContext } from "react";
import {
  Card, CardContent, TextField,
  Button, Typography, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, Stack, Box
} from "@mui/material";
import { Edit, Delete, Cancel } from "@mui/icons-material";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";
import { AuthContext } from "../../context/Authcontext"; // Import du contexte d'authentification

export default function Filieres() {
  const { user } = useContext(AuthContext); // Récupération de l'utilisateur connecté
  const [filieres, setFilieres] = useState([]);
  
  // États du formulaire
  const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [departement, setDepartement] = useState("");
  const [editId, setEditId] = useState(null);

  // --- LOGIQUE DE DROITS ---
  const userGroups = Array.isArray(user?.groups) 
    ? user.groups.map(g => g.toUpperCase()) 
    : [];
  const isAdmin = userGroups.includes("ADMIN");

  const chargerFilieres = async () => {
    try {
      const res = await api.get("filieres/");
      setFilieres(res.data);
    } catch (e) {
      console.error("Erreur chargement:", e);
    }
  };

  useEffect(() => {
    chargerFilieres();
  }, []);

  const handleSubmit = async () => {
    if (!code || !nom || !departement) {
      alert("Tous les champs sont obligatoires");
      return;
    }
    const data = { code_filiere: code, nom_filiere: nom, departement: departement };
    try {
      if (editId) {
        await api.put(`filieres/${editId}/`, data);
      } else {
        await api.post("filieres/", data);
      }
      resetForm();
      chargerFilieres();
    } catch (e) {
      alert(editId ? "Erreur modification" : "Erreur création");
    }
  };

  const handleSupprimer = async (id) => {
    if (window.confirm("Supprimer cette filière ?")) {
      try {
        await api.delete(`filieres/${id}/`);
        chargerFilieres();
      } catch (e) {
        if (e.response && e.response.status === 500) {
          alert("Impossible de supprimer : des étudiants sont inscrits dans cette filière.");
        } else {
          alert("Erreur lors de la suppression.");
        }
      }
    }
  };

  const preparerModification = (f) => {
    setEditId(f.id);
    setCode(f.code_filiere);
    setNom(f.nom_filiere);
    setDepartement(f.departement);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setEditId(null);
    setCode("");
    setNom("");
    setDepartement("");
  };

  return (
    <DashboardLayout>
      <Typography variant="h5" fontWeight="bold">Référentiel Filières</Typography>

      {/* 1. FORMULAIRE : Visible UNIQUEMENT par l'ADMIN */}
      {isAdmin && (
        <Card sx={{ mt: 2, borderTop: editId ? "4px solid #1976d2" : "none", boxShadow: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
              {editId ? `Modification de la filière ID: ${editId}` : "Ajouter une nouvelle filière"}
            </Typography>
            
            <Stack spacing={2}>
              <TextField
                label="Code filière (ex: GL)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Nom filière"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Département"
                value={departement}
                onChange={(e) => setDepartement(e.target.value)}
                fullWidth
                size="small"
              />
              
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color={editId ? "success" : "primary"}
                  onClick={handleSubmit}
                >
                  {editId ? "Mettre à jour" : "Ajouter"}
                </Button>
                
                {editId && (
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    startIcon={<Cancel />}
                    onClick={resetForm}
                  >
                    Annuler
                  </Button>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* 2. TABLEAU : Actions limitées à l'ADMIN */}
      <Card sx={{ mt: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Liste des filières</Typography>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Code</strong></TableCell>
                <TableCell><strong>Nom</strong></TableCell>
                <TableCell><strong>Département</strong></TableCell>
                {isAdmin && <TableCell align="right"><strong>Actions</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filieres.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>{f.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{f.code_filiere}</TableCell>
                  <TableCell>{f.nom_filiere}</TableCell>
                  <TableCell>{f.departement}</TableCell>
                  
                  {isAdmin && (
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => preparerModification(f)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleSupprimer(f.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filieres.length === 0 && (
                <TableRow>
                   <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 3 }}>
                      Aucune filière trouvée.
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

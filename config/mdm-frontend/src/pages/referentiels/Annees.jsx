import { useEffect, useState, useContext } from "react";
// AJOUT de Chip dans les imports ci-dessous
import { 
  Card, CardContent, TextField, Button, Typography, 
  Table, TableHead, TableRow, TableCell, TableBody, 
  MenuItem, IconButton, Box, Chip 
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";
import { AuthContext } from "../../context/Authcontext";

export default function Annees() {
  const { user } = useContext(AuthContext);
  const [annees, setAnnees] = useState([]);
  const [libelle, setLibelle] = useState("");
  /* const [statut, setStatut] = useState("ACTIVE"); */
  const [editId, setEditId] = useState(null);
  const [statut, setStatut] = useState("ACTIVE"); 
  const userGroups = Array.isArray(user?.groups) 
    ? user.groups.map(g => g.toUpperCase()) 
    : [];
  const isAdmin = userGroups.includes("ADMIN");

  const chargerAnnees = async () => {
    try {
      const res = await api.get("annees/");
      setAnnees(res.data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { chargerAnnees(); }, []);

  const soumettreFormulaire = async () => {
    if (!libelle) return alert("Le libellé est obligatoire");
    try {
      if (editId) {
        await api.put(`annees/${editId}/`, { libelle, statut });
      } else {
        await api.post("annees/", { libelle, statut });
      }
      setLibelle(""); setStatut("ACTIVE"); setEditId(null);
      chargerAnnees();
    } catch (e) { alert("Une erreur est survenue"); }
  };

  const supprimerAnnee = async (id) => {
    if (window.confirm("Supprimer cette année ?")) {
      try {
        await api.delete(`annees/${id}/`);
        chargerAnnees();
      } catch (e) { 
        alert(e.response?.status === 500 
          ? "Impossible : cette année contient des étudiants." 
          : "Erreur suppression"); 
      }
    }
  };

  const preparerModification = (a) => {
    setEditId(a.id);
    setLibelle(a.libelle);
    setStatut(a.statut);
    window.scrollTo(0, 0);
  };

  return (
    <DashboardLayout>
      <Typography variant="h5" fontWeight="bold">Référentiel Années Académiques</Typography>

      {/* FORMULAIRE : Visible UNIQUEMENT par l'ADMIN */}
      {isAdmin && (
        <Card sx={{ mt: 3, border: editId ? '1px solid #1976d2' : 'none', boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {editId ? "Modifier l'année" : "Créer une nouvelle année"}
            </Typography>
            
            {/* Utilisation de Box au lieu de Grid pour éviter les erreurs de version */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField 
                  label="Libellé" 
                  fullWidth 
                  value={libelle} 
                  onChange={(e) => setLibelle(e.target.value)} 
                />
                <TextField 
                  select 
                  label="Statut" 
                  fullWidth 
                  value={statut} 
                  onChange={(e) => setStatut(e.target.value)}
                  disabled={!editId} // Optionnel : On ne peut changer le statut que si on MODIFIE une année existante
                >
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                </TextField>
            </Box>

            <Box sx={{ mt: 3 }}>
                <Button variant="contained" onClick={soumettreFormulaire}>
                    {editId ? "Mettre à jour" : "Ajouter l'année"}
                </Button>
                {editId && (
                  <Button sx={{ ml: 2 }} color="inherit" onClick={() => { setEditId(null); setLibelle(""); }}>
                    Annuler
                  </Button>
                )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Liste des années</Typography>
          <Table sx={{ mt: 2 }}>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><strong>Libellé</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                {isAdmin && <TableCell align="right"><strong>Actions</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {annees.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>{a.libelle}</TableCell>
                  <TableCell>
                    {/* Le Chip est maintenant bien défini */}
                    <Chip 
                        label={a.statut} 
                        color={a.statut === "ACTIVE" ? "success" : "default"} 
                        size="small" 
                    />
                  </TableCell>
                  
                  {isAdmin && (
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => preparerModification(a)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => supprimerAnnee(a.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

import { useEffect, useState, useContext } from "react";
import {
  Card, CardContent, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Button, IconButton, Box, Chip, 
  TextField, InputAdornment, MenuItem, Stack, Avatar, Tooltip
} from "@mui/material";
import { Edit, Delete, PersonAdd, Search, FilterList, PersonSearch } from "@mui/icons-material";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";
import EtudiantForm from "./EtudiantForm";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Authcontext"; // Import du contexte pour les rôles

export default function Etudiants() {
  const { user } = useContext(AuthContext);
  const [etudiants, setEtudiants] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const navigate = useNavigate();

  // --- ÉTATS POUR RECHERCHE ET FILTRES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFiliere, setFilterFiliere] = useState("TOUS");
  const [filterStatut, setFilterStatut] = useState("TOUS");

  // --- LOGIQUE DES RÔLES ---
  const userGroups = Array.isArray(user?.groups) ? user.groups.map(g => g.toUpperCase()) : [];
  const isAdmin = userGroups.includes("ADMIN");
  const isScolarite = userGroups.includes("SCOLARITE");
  const isConsultation = userGroups.includes("CONSULTATION");

  const chargerEtudiants = async () => {
    try {
      const res = await api.get("etudiants/");
      setEtudiants(res.data);
    } catch (e) { console.error("Erreur chargement:", e); }
  };

  useEffect(() => { chargerEtudiants(); }, []);

  const handleSupprimer = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet étudiant ?")) {
      try {
        await api.delete(`etudiants/${id}/`);
        chargerEtudiants();
      } catch (e) { alert("Erreur lors de la suppression"); }
    }
  };
  const handleOpenForm = (etudiant = null) => {
  setSelectedEtudiant(etudiant);
  setOpen(true);
};

  // --- LOGIQUE DE FILTRAGE AVANCÉ ---
  const etudiantsFiltrés = etudiants.filter((e) => {
    const matchRecherche = 
      e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.matricule_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchFiliere = filterFiliere === "TOUS" || e.filiere_detail?.nom_filiere === filterFiliere;
    const matchStatut = filterStatut === "TOUS" || 
      (filterStatut === "ACTIF" ? e.is_active : !e.is_active);

    return matchRecherche && matchFiliere && matchStatut;
  });

  // Liste unique des filières pour le menu déroulant
  const listeFilieres = ["TOUS", ...new Set(etudiants.map(e => e.filiere_detail?.nom_filiere).filter(Boolean))];

  return (
    <DashboardLayout>
      {/* HEADER AVEC ACTIONS */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: "#1e293b" }}>
            Répertoire <span style={{ color: "#1976d2" }}>Étudiants</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isConsultation ? "Registre en lecture seule" : "Gestion centralisée du Master Data"}
          </Typography>
        </Box>

        {!isConsultation &&(
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => { setSelectedEtudiant(null); setOpen(true); }}
            sx={{ borderRadius: 2, px: 3, py: 1.2, boxShadow: 3 }}
          >
            Nouvel étudiant
          </Button>
        )}
      </Box>

      {/* BARRE DE RECHERCHE ET FILTRES (UX AMÉLIORÉ) */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <CardContent>
          <GridContainerBox sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              placeholder="Rechercher par nom ou matricule..."
              size="small"
              sx={{ flexGrow: 1, minWidth: "300px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label="Filière"
              size="small"
              sx={{ minWidth: "180px" }}
              value={filterFiliere}
              onChange={(e) => setFilterFiliere(e.target.value)}
            >
              {listeFilieres.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Statut"
              size="small"
              sx={{ minWidth: "150px" }}
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <MenuItem value="TOUS">Tous les statuts</MenuItem>
              <MenuItem value="ACTIF">Actifs</MenuItem>
              <MenuItem value="INACTIF">Inactifs</MenuItem>
            </TextField>
          </GridContainerBox>
        </CardContent>
      </Card>

      <EtudiantForm
        open={open}
        etudiantData={selectedEtudiant}
        onClose={() => { setOpen(false); setSelectedEtudiant(null); }}
        onSuccess={() => { chargerEtudiants(); setOpen(false); setSelectedEtudiant(null); }}
      />

      {/* TABLEAU DES RÉSULTATS */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "700" }}>Identité</TableCell>
              <TableCell sx={{ fontWeight: "700" }}>Matricule</TableCell>
              <TableCell sx={{ fontWeight: "700" }}>Filière</TableCell>
              <TableCell sx={{ fontWeight: "700" }}>Année</TableCell>
              <TableCell sx={{ fontWeight: "700" }}>Statut</TableCell>
              {!isConsultation && <TableCell align="right" sx={{ fontWeight: "700" }}>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {etudiantsFiltrés.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">Aucun étudiant trouvé</Typography>
                </TableCell>
              </TableRow>
            ) : (
              etudiantsFiltrés.map((e) => (
                <TableRow
                  key={e.id}
                  hover
                  sx={{ cursor: "pointer", transition: "0.2s" }}
                  onClick={() => navigate(`/dossier/${e.id}`)}
                >
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 34, height: 34, bgcolor: "#e2e8f0", color: "#1976d2", fontWeight: "bold", fontSize: 14 }}>
                        {e.nom?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">{e.nom?.toUpperCase()}</Typography>
                        <Typography variant="caption" color="text.secondary">{e.prenom}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip label={e.matricule_id || "N/A"} size="small" variant="outlined" sx={{ fontWeight: "bold" }} />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{e.filiere_detail?.nom_filiere || "N/A"}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{e.annee_detail?.libelle || "-"}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={e.is_active ? "Actif" : "Inactif"}
                      color={e.is_active ? "success" : "default"}
                      size="small"
                      sx={{ minWidth: "70px", fontWeight: "600" }}
                    />
                  </TableCell>

                  {/* ACTIONS : Masquées pour Consultation, bouton suppression masqué pour Scolarité */}
                  {!isConsultation &&  (
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Modifier">
                          <IconButton size="small" color="primary" onClick={(ev) => { ev.stopPropagation(); handleOpenForm(e); }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {isAdmin &&  (
                          <Tooltip title="Supprimer">
                            <IconButton size="small" color="error" onClick={(ev) => { ev.stopPropagation(); handleSupprimer(e.id); }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </DashboardLayout>
  );
}

// Petit composant utilitaire pour le layout des filtres
const GridContainerBox = ({ children, sx }) => <Box sx={sx}>{children}</Box>;


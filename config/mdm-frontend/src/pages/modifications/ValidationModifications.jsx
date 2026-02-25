import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function ValidationModifications() {
  const [modifications, setModifications] = useState([]);
  
  // États pour le rejet
  const [motifRejet, setMotifRejet] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const chargerModifications = async () => {
    try {
      const res = await api.get("modifications/en-attente/");
      setModifications(res.data);
    } catch (e) {
      console.error("Erreur chargement modifications :", e);
    }
  };

  useEffect(() => {
    chargerModifications();
  }, []);

  const validerModification = async (id) => {
    if (!window.confirm("Voulez-vous vraiment valider cette modification ?")) return;
    try {
      await api.post(`modifications/valider/${id}/`);
      chargerModifications(); 
    } catch (e) {
      console.error("Erreur validation :", e);
      alert("Erreur lors de la validation.");
    }
  };

  // Logique de rejet
  const ouvrirDialogRejet = (id) => {
    setSelectedId(id);
    setOpenDialog(true);
  };

  const confirmerRejet = async () => {
    if (!motifRejet.trim()) {
      alert("Veuillez saisir un motif de rejet.");
      return;
    }
    try {
      await api.post(`modifications/rejeter/${selectedId}/`, {
        motif: motifRejet
      });
      setOpenDialog(false);
      setMotifRejet("");
      chargerModifications();
    } catch (e) {
      console.error("Erreur rejet :", e);
      alert("Erreur lors du rejet.");
    }
  };

  const formaterValeur = (champ, valeur) => {
    if (champ === "is_active") {
      return valeur === "true" ? 
        <Chip label="Activer" size="small" color="success" variant="outlined" /> : 
        <Chip label="Désactiver" size="small" color="error" variant="outlined" />;
    }
    return valeur;
  };

  return (
    <DashboardLayout>
      <Typography variant="h5" fontWeight="bold">
        Modifications en attente de validation
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Table>
            <TableHead sx={{ bgcolor: "#f8f9fa" }}>
              <TableRow>
                <TableCell>Étudiant</TableCell>
                <TableCell>Champ</TableCell>
                <TableCell>Ancienne valeur</TableCell>
                <TableCell>Nouvelle valeur</TableCell>
                <TableCell>Proposé par</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {modifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography sx={{ py: 2, color: "text.secondary" }}>
                      Aucune modification en attente
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {modifications.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {m.etudiant_nom || "Inconnu"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Matricule: {m.etudiant_matricule}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip label={m.champ} size="small" variant="contained" />
                  </TableCell>

                  <TableCell>{formaterValeur(m.champ, m.ancienne_valeur)}</TableCell>
                  <TableCell sx={{ color: "primary.main", fontWeight: "medium" }}>
                    {formaterValeur(m.champ, m.nouvelle_valeur)}
                  </TableCell>
                  
                  <TableCell>{m.propose_par_nom}</TableCell>
                  
                  <TableCell>
                    {new Date(m.date_proposition).toLocaleDateString('fr-FR')}
                  </TableCell>

                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => validerModification(m.id)}
                      >
                        Valider
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => ouvrirDialogRejet(m.id)}
                      >
                        Rejeter
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogue de rejet */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Motif du rejet</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
              placeholder="Expliquez pourquoi la modification est rejetée"
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Annuler</Button>
          <Button
            onClick={confirmerRejet}
            variant="contained"
            color="error"
            disabled={!motifRejet.trim()}
          >
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { 
  Card, CardContent, Typography, Table, TableHead, TableRow, 
  TableCell, TableBody, Chip, Checkbox, Box, Button 
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function MesPropositions() {
  const [propositions, setPropositions] = useState([]);
  // État pour la sélection
  const [selectedIds, setSelectedIds] = useState([]);

  const chargerPropositions = async () => {
    try {
      const res = await api.get("modifications/mes-propositions/");
      setPropositions(res.data);
    } catch (e) {
      console.error("Erreur chargement :", e);
    }
  };

  useEffect(() => {
    chargerPropositions();
  }, []);

  // --- LOGIQUE DE SÉLECTION ---
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(propositions.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // --- LOGIQUE DE SUPPRESSION ---
  const handleSupprimerSelection = async () => {
    if (window.confirm(`Supprimer ${selectedIds.length} proposition(s) de votre liste ?`)) {
      try {
        // On boucle sur les suppressions (Assurez-vous que l'URL backend accepte DELETE sur modifications/id/)
        await Promise.all(selectedIds.map(id => api.delete(`modifications/${id}/`)));
        
        setSelectedIds([]);
        chargerPropositions();
      } catch (e) {
        alert("Erreur lors de la suppression. Certaines demandes validées/rejetées ne peuvent peut-être plus être supprimées.");
      }
    }
  };

  return (
    <DashboardLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Suivi de mes demandes</Typography>
        
        {selectedIds.length > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={handleSupprimerSelection}
          >
            Supprimer ({selectedIds.length})
          </Button>
        )}
      </Box>

      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8f9fa" }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedIds.length > 0 && selectedIds.length < propositions.length}
                    checked={propositions.length > 0 && selectedIds.length === propositions.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell><b>Étudiant</b></TableCell>
                <TableCell><b>Champ</b></TableCell>
                <TableCell><b>Nouvelle valeur</b></TableCell>
                <TableCell><b>Statut</b></TableCell>
                <TableCell><b>Motif / Commentaire</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {propositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Aucune proposition trouvée
                  </TableCell>
                </TableRow>
              ) : (
                propositions.map((p) => (
                  <TableRow key={p.id} hover selected={selectedIds.includes(p.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(p.id)}
                        onChange={() => handleSelectOne(p.id)}
                      />
                    </TableCell>
                    <TableCell>{p.etudiant_nom}</TableCell>
                    <TableCell><Chip label={p.champ} size="small" variant="outlined" /></TableCell>
                    <TableCell>{p.nouvelle_valeur}</TableCell>
                    <TableCell>
                      <Chip 
                        label={p.statut} 
                        size="small"
                        color={p.statut === 'VALIDE' ? 'success' : p.statut === 'REJETE' ? 'error' : 'warning'} 
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'error.main', fontStyle: 'italic', fontSize: '0.85rem' }}>
                      {p.statut === 'REJETE' ? (p.motif_rejet || "Non spécifié") : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Box, Checkbox, IconButton, Tooltip, Button
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function Historique() {
  const [logs, setLogs] = useState([]);
  // État pour gérer la sélection multiple
  const [selectedIds, setSelectedIds] = useState([]);

  const chargerHistorique = async () => {
    try {
      const res = await api.get("historique/");
      setLogs(res.data);
    } catch (error) {
      console.error("Erreur chargement historique", error);
    }
  };

  useEffect(() => {
    chargerHistorique();
  }, []);

  // --- NOUVELLE LOGIQUE : Sélection ---
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(logs.map((log) => log.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // --- NOUVELLE LOGIQUE : Suppression ---
  const handleSupprimerSelection = async () => {
    if (window.confirm(`Supprimer ${selectedIds.length} ligne(s) d'historique ?`)) {
      try {
        // Optionnel : Appel API pour suppression groupée si supporté
        // Sinon boucle sur les IDs
        await Promise.all(selectedIds.map(id => api.delete(`historique/${id}/`)));
        
        setSelectedIds([]);
        chargerHistorique();
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const renderAction = (action) => {
    switch (action) {
      case "CREATION": return <Chip label="Création" color="primary" size="small" />;
      case "MODIFICATION": return <Chip label="Modification" color="warning" size="small" />;
      case "VALIDATION": return <Chip label="Validation" color="success" size="small" />;
      case "REJET": return <Chip label="Rejet" color="error" size="small" />;
      case "UPDATE": return <Chip label="Mise à jour" color="info" size="small" />;
      default: return <Chip label={action} size="small" />;
    }
  };

  return (
    <DashboardLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Historique des actions
        </Typography>

        {/* Bouton de suppression groupée visible uniquement si sélection */}
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
        <CardContent sx={{ p: 0 }}> {/* p:0 pour que la table prenne toute la largeur */}
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedIds.length > 0 && selectedIds.length < logs.length}
                    checked={logs.length > 0 && selectedIds.length === logs.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Modèle</TableCell>
                <TableCell>ID Objet</TableCell>
                <TableCell>Détails</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">Aucun historique</TableCell>
                </TableRow>
              )}

              {logs.map((log) => (
                <TableRow 
                  key={log.id} 
                  hover 
                  selected={selectedIds.includes(log.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(log.id)}
                      onChange={() => handleSelectOne(log.id)}
                    />
                  </TableCell>
                  <TableCell>{log.utilisateur_nom}</TableCell>
                  <TableCell>{log.role_au_moment}</TableCell>
                  <TableCell>{renderAction(log.action)}</TableCell>
                  <TableCell>{log.modele}</TableCell>
                  <TableCell>{log.objet_id}</TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>
                    {log.date ? new Date(log.date).toLocaleString("fr-FR") : "Date inconnue"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

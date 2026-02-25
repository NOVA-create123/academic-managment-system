import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Pour récupérer le matricule dans l'URL
import { Box, Tabs, Tab, Typography, CircularProgress, Alert, Paper } from "@mui/material";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

import InfosGenerales from "./tabs/InfosGenerales";
import Scolarite from "./tabs/Scolarite";
import Contacts from "./tabs/Contacts";
import Actions from "./tabs/Actions";

export default function DossierEtudiant() {
  const { id } = useParams(); 
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchDossier = async () => {
      setLoading(true);
      try {
        // Appelle ton nouvel endpoint. 
       
        const res = await api.get(`dossier/${id}/`); 
        console.log("CONTENU DU DOSSIER :", res.data); // <--- Regarde bien l'objet 'scolarite' ici
        console.log("CONTENU SCOLARITE :", res.data.scolarite); 
        setStudentData(res.data);
        setError(null);
      } catch (err) {
        setError("Dossier introuvable ou erreur serveur.");
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDossier();
  }, [id]);

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          {loading ? "Chargement..." : studentData ? `${studentData.nom} ${studentData.prenom}` : "Dossier Étudiant"}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Matricule : {studentData?.matricule_id || "N/A"}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Informations" />
          <Tab label="Parcours Académique" />
          <Tab label="Contacts & Tuteur" />
          <Tab label="Actions Gestion" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" sx={{ mt: 5 }}><CircularProgress /></Box>
      ) : (
        <Box>
          {/* On injecte les sous-objets du JSON aux onglets */}
          {tab === 0 && <InfosGenerales data={studentData} />}
          {tab === 1 && <Scolarite data={studentData?.scolarite} />}
          {tab === 2 && <Contacts data={studentData} />}
          {tab === 3 && <Actions data={studentData} />}
        </Box>
      )}
    </DashboardLayout>
  );
}

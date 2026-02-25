// src/pages/dossier/tabs/Contacts.jsx
import { Card, CardContent, Typography, Alert } from "@mui/material";

export default function Contacts({ data }) {
  // Si les données ne sont pas encore là
  if (!data) return <Alert severity="info">Chargement des contacts...</Alert>;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>Contacts & Tuteur</Typography>
        
        {/* On pioche dans 'data' qui contient l'étudiant reçu de l'API */}
        <Typography>
          <b>Nom du tuteur :</b> {data.tuteur_nom || "Non renseigné"}
        </Typography>
        
        <Typography>
          <b>Téléphone :</b> {data.telephone || "Non renseigné"}
        </Typography>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, Typography } from "@mui/material";
export default function InfosGenerales({ data }) {
  if (!data) return <Typography>Aucune donnée disponible</Typography>;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography sx={{ mb: 1 }}><b>Matricule :</b> {data.matricule_id || "N/A"}</Typography>
        <Typography sx={{ mb: 1 }}><b>Nom :</b> {data.nom}</Typography>
        <Typography sx={{ mb: 1 }}><b>Prénom :</b> {data.prenom}</Typography>
        <Typography><b>Téléphone :</b> {data.telephone}</Typography>
      </CardContent>
    </Card>
  );
}

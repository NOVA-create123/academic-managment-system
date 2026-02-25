import { Card, CardContent, Typography, Alert } from "@mui/material";
export default function Scolarite({ data }) {
  if (!data) return <Alert severity="info">Aucune inscription trouvée.</Alert>;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Parcours Académique
        </Typography>

        <Typography>
          <b>Filière :</b> {data.filiere?.nom_filiere}
        </Typography>

        <Typography>
          <b>Code :</b> {data.filiere?.code_filiere}
        </Typography>

        <Typography>
          <b>Année :</b> {data.annee_academique?.libelle}
        </Typography>
      </CardContent>
    </Card>
  );
}

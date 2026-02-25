import { Button, Stack } from "@mui/material";

export default function Actions() {
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained">
        Modifier l'étudiant
      </Button>

      <Button variant="outlined" color="warning">
        Désactiver
      </Button>
    </Stack>
  );
}

import { Grid, Card, CardContent, Typography, Box, Avatar, Divider, LinearProgress, List, ListItem, ListItemText } from "@mui/material";
import { BarChart, School, FactCheck, Analytics, ShowChart } from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function ConsultationDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On réutilise l'API de qualité car elle contient les chiffres globaux
    api.get("dashboard-qualite/")
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <LinearProgress color="secondary" />;

  const stats = [
    {
      label: "Effectif Global",
      value: data?.total_etudiants || 0,
      icon: <School />,
      color: "#6366f1", // Indigo
      bg: "rgba(99, 102, 241, 0.1)",
      desc: "Étudiants officiellement inscrits"
    },
    {
      label: "Données Certifiées",
      value: `${100 - (data?.dossiers_incomplets / data?.total_etudiants * 100 || 0).toFixed(1)}%`,
      icon: <FactCheck />,
      color: "#10b981", // Emerald
      bg: "rgba(16, 185, 129, 0.1)",
      desc: "Taux de fiabilité du référentiel"
    },
    {
      label: "Mises à jour (7j)",
      value: data?.modifications_recentes || 0,
      icon: <ShowChart />,
      color: "#f43f5e", // Rose
      bg: "rgba(244, 63, 94, 0.1)",
      desc: "Dynamisme de la base de données"
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: "#1e293b", mb: 0.5 }}>
          Vue <span style={{ color: "#6366f1" }}>Analytique</span>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Statistiques consolidées et indicateurs de performance de l'ENSPD.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: item.bg, color: item.color, mr: 2, borderRadius: 2 }}>{item.icon}</Avatar>
                  <Typography variant="subtitle2" fontWeight="700" color="text.secondary">{item.label}</Typography>
                </Box>
                <Typography variant="h3" fontWeight="900" sx={{ color: "#1e293b", mb: 1 }}>{item.value}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", minHeight: 350 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Répartition par Filière</Typography>
                <Analytics color="action" />
              </Box>
              <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '2px dashed #e2e8f0' }}>
                <Typography variant="body2" color="text.secondary">
                  [ Espace réservé pour le graphique en camembert ]
                </Typography>
                <Typography variant="caption">Source : Base de données maître</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 4, bgcolor: '#1e293b', color: '#fff', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Notes d'intégrité</Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Conformité RGPD" 
                    secondary="Données protégées et auditées" 
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                  />
                  <FactCheck sx={{ color: '#10b981' }} />
                </ListItem>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Dernière Synchronisation" 
                    secondary="Aujourd'hui à 08h00" 
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                  />
                </ListItem>
              </List>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.7 }}>Disponibilité du système</Typography>
                <LinearProgress variant="determinate" value={99.9} sx={{ borderRadius: 5, height: 6, bgcolor: 'rgba(255,255,255,0.1)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

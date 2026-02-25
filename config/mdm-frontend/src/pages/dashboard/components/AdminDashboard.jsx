import { Grid, Card, CardContent, Typography, Box, LinearProgress, Avatar } from "@mui/material";
import { People, WarningAmber, ErrorOutline, CheckCircleOutline, TrendingUp } from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("dashboard-qualite/")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <LinearProgress />;

  // Calcul d'un taux de qualité fictif basé sur les données réelles pour l'UI
  const total = data.total_etudiants || 1;
  const erreurs = (data.doublons_suspects || 0) + (data.dossiers_incomplets || 0);
  const tauxQualite = Math.max(0, Math.min(100, 100 - (erreurs / total * 100))).toFixed(1);

  const stats = [
    {
      label: "Effectif Total",
      value: data.total_etudiants,
      icon: <People sx={{ fontSize: 30 }} />,
      color: "#3b82f6", // Blue
      bg: "rgba(59, 130, 246, 0.1)",
      desc: "Étudiants actifs inscrits"
    },
    {
      label: "Doublons Suspects",
      value: data.doublons_suspects,
      icon: <WarningAmber sx={{ fontSize: 30 }} />,
      color: "#f59e0b", // Amber
      bg: "rgba(245, 158, 11, 0.1)",
      desc: "Doublons détectés en Staging"
    },
    {
      label: "Dossiers Incomplets",
      value: data.dossiers_incomplets,
      icon: <ErrorOutline sx={{ fontSize: 30 }} />,
      color: "#ef4444", // Red
      bg: "rgba(239, 68, 68, 0.1)",
      desc: "Champs obligatoires manquants"
    },
    {
      label: "Indice de Qualité",
      value: `${tauxQualite}%`,
      icon: <CheckCircleOutline sx={{ fontSize: 30 }} />,
      color: "#10b981", // Emerald
      bg: "rgba(16, 185, 129, 0.1)",
      desc: "Santé globale des données"
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        {/* <Typography variant="h4" fontWeight="800" sx={{ color: "#1e293b", mb: 0.5 }}>
          Tableau de <span style={{ color: "#3b82f6" }}>Bord</span>
        </Typography> */}
        <Typography variant="body2" color="text.secondary">
          Analyse en temps réel de l'intégrité des données de l'ENSPD.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: 4, 
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-5px)" }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Avatar sx={{ bgcolor: item.bg, color: item.color, width: 56, height: 56, borderRadius: 3 }}>
                    {item.icon}
                  </Avatar>
                  <Box sx={{ display: "flex", alignItems: "center", color: "success.main" }}>
                    <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" fontWeight="bold">LIVE</Typography>
                  </Box>
                </Box>
                
                <Typography variant="h4" fontWeight="800" sx={{ color: "#1e293b", mb: 0.5 }}>
                  {item.value}
                </Typography>
                <Typography variant="subtitle2" fontWeight="600" color="text.secondary" sx={{ mb: 1 }}>
                  {item.label}
                </Typography>
                <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                  {item.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Section Analyse Graphique ou Info additionnelle */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 4, height: '100%', border: "1px solid #e2e8f0" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Activité Récente</Typography>
              <Box sx={{ py: 10, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '2px dashed #e2e8f0' }}>
                 <Typography color="text.secondary">Graphique d'évolution (Chart.js à venir)</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, bgcolor: '#1e293b', color: '#fff', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Résumé Qualité</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                Le score de qualité est calculé sur la base des dossiers complets par rapport au total des inscrits.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption">Fiabilité des données</Typography>
                  <Typography variant="caption" fontWeight="bold">{tauxQualite}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={parseFloat(tauxQualite)} 
                  sx={{ height: 8, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6' } }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Composant Divider simple pour l'UI
const Divider = ({ sx }) => <Box sx={{ height: '1px', bgcolor: '#e2e8f0', ...sx }} />;

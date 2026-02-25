import { Grid, Card, CardContent, Typography, Box, Avatar, Divider, LinearProgress, Stack } from "@mui/material";
import { Assignment, PendingActions, CancelScheduleSend, CheckCircle, TrendingUp } from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function ScolariteDashboard() {
  const [mesPropositions, setMesPropositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("modifications/mes-propositions/")
      .then(res => {
        setMesPropositions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const total = mesPropositions.length;
  const enAttente = mesPropositions.filter(p => p.statut === "EN_ATTENTE").length;
  const rejetees = mesPropositions.filter(p => p.statut === "REJETE").length;
  const validees = mesPropositions.filter(p => p.statut === "VALIDE").length;

  // Calcul du taux de succès des propositions
  const tauxSucces = total > 0 ? ((validees / total) * 100).toFixed(0) : 0;

  if (loading) return <LinearProgress sx={{ borderRadius: 5, height: 6 }} />;

  const stats = [
    {
      label: "Total Propositions",
      value: total,
      icon: <Assignment />,
      color: "#0284c7", // Sky Blue
      bg: "rgba(2, 132, 199, 0.1)",
      desc: "Demandes soumises au total"
    },
    {
      label: "En Attente",
      value: enAttente,
      icon: <PendingActions />,
      color: "#f59e0b", // Amber
      bg: "rgba(245, 158, 11, 0.1)",
      desc: "En attente de validation admin"
    },
    {
      label: "Rejetées",
      value: rejetees,
      icon: <CancelScheduleSend />,
      color: "#ef4444", // Red
      bg: "rgba(239, 68, 68, 0.1)",
      desc: "À corriger et soumettre à nouveau"
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: "#1e293b", mb: 0.5 }}>
            Mon Espace <span style={{ color: "#0284c7" }}>Scolarité</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Suivi en temps réel de vos propositions de modifications.
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="caption" fontWeight="700" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUp fontSize="small" /> TAUX D'APPROBATION
          </Typography>
          <Typography variant="h5" fontWeight="900" color="#1e293b">{tauxSucces}%</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {stats.map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ 
              borderRadius: 4, 
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: item.bg, color: item.color, width: 50, height: 50, borderRadius: 2 }}>
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ color: "#1e293b", lineHeight: 1 }}>
                      {item.value}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
                      {item.label}
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant="caption" sx={{ color: "#64748b", fontStyle: 'italic' }}>
                  {item.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 4, 
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", 
            color: "#fff",
            p: 1
          }}>
            <CardContent>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Récapitulatif de Performance</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                    Sur vos <strong>{total}</strong> propositions, <strong>{validees}</strong> ont été officiellement intégrées à la base de données maître de l'ENSPD.
                  </Typography>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>Progression vers l'objectif de qualité</Typography>
                      <Typography variant="caption" fontWeight="bold">{tauxSucces}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Number(tauxSucces)} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5, 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        '& .MuiLinearProgress-bar': { bgcolor: '#0284c7' } 
                      }} 
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CheckCircle sx={{ fontSize: 80, color: '#10b981', opacity: 0.2, position: 'absolute', top: -10, right: -10 }} />
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Typography variant="h3" fontWeight="900" color="#38bdf8">{validees}</Typography>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Validées</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

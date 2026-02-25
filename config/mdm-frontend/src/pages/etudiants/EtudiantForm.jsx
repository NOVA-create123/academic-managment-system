import { useState, useEffect, useContext } from "react"; 
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Grid, MenuItem, Typography, Box
} from "@mui/material";
import api from "../../api/axios";
import { AuthContext } from "../../context/Authcontext"; 

export default function EtudiantForm({ open, onClose, onSuccess, etudiantData }) {
  const { user } = useContext(AuthContext); 
  const [formData, setFormData] = useState({
    nom: "", prenom: "", telephone: "", tuteur_nom: "",
    is_active: true, filiere: "", annee_academique: ""
  });
  
  const [options, setOptions] = useState({ filieres: [], annees: [] });

  useEffect(() => {
    if (open) {
      const fetchRefs = async () => {
        try {
          const [resF, resA] = await Promise.all([api.get("filieres/"), api.get("annees/")]);
          
          // --- LOGIQUE DE FILTRAGE DES ANNÉES ---
          let anneesTraitees = resA.data;

          if (!etudiantData) {
            // Cas NOUVEL ÉTUDIANT : On ne garde QUE les années actives
            anneesTraitees = resA.data.filter(a => a.statut === "ACTIVE");
          } 
          // Si c'est une modification, on garde tout pour ne pas "casser" l'affichage
          // de l'année actuelle si elle est déjà devenue inactive.

          setOptions({ filieres: resF.data, annees: anneesTraitees });
        } catch (e) { console.error("Erreur refs:", e); }
      };
      fetchRefs();
    }
  }, [open, etudiantData]);

  useEffect(() => {
    if (etudiantData) {
      setFormData({
        nom: etudiantData.nom || "",
        prenom: etudiantData.prenom || "",
        telephone: etudiantData.telephone || "",
        tuteur_nom: etudiantData.tuteur_nom || "",
        filiere: etudiantData.filiere_detail?.id || etudiantData.filiere || "",
        annee_academique: etudiantData.annee_detail?.id || etudiantData.annee_academique || "",
        is_active: etudiantData.is_active ?? true 
      });
    } else {
      setFormData({ nom: "", prenom: "", telephone: "", tuteur_nom: "", is_active: true, filiere: "", annee_academique: "" });
    }
  }, [etudiantData, open]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    // Empêche tout comportement par défaut (rechargement de page)
    if(e) e.preventDefault(); 

    if (!formData.filiere || !formData.annee_academique) {
        return alert("Veuillez sélectionner la filière et l'année académique.");
    }

    try {
      if (!etudiantData?.id) {
        await api.post("etudiants/", formData);
        alert("Étudiant enregistré avec succès !");
        onSuccess();
        return;
      }

      const isAdmin = user?.groups?.some(g => g.toUpperCase() === "ADMIN");

      if (isAdmin) {
        await api.put(`etudiants/${etudiantData.id}/`, formData);
        alert("Modifié avec succès (Admin)");
        onSuccess();
      } else {
        const champsSensisbles = ["nom", "prenom", "telephone", "tuteur_nom", "filiere", "annee_academique", "is_active"];
        let compteur = 0;

        for (const champ of champsSensisbles) {
          // Comparaison des valeurs (attention aux IDs pour les relations)
          const ancienneValeur = etudiantData[champ]?.id || etudiantData[champ];
          if (String(formData[champ]) !== String(ancienneValeur)) {
            await api.post("modifications/proposer/", {
              matricule: etudiantData.matricule_id,
              champ: champ,
              nouvelle_valeur: formData[champ]
            });
            compteur++;
          }
        }

        if (compteur > 0) {
          alert(`${compteur} proposition(s) envoyée(s) pour validation.`);
        } else {
          alert("Aucun changement détecté.");
        }
        onSuccess();
      }
    } catch (error) {
      console.error("Détail erreur:", error.response?.data);
      alert("Erreur lors de l'enregistrement. Vérifiez les champs.");
    }
  };
   // Sécurité anti-crash si le dialogue est fermé
  if (!open) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
        {etudiantData ? "Modifier le dossier étudiant" : "Inscription : Nouvel Étudiant"}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            * Les modifications soumises par la scolarité sont sujettes à validation par l'administrateur.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}><TextField label="Nom" name="nom" fullWidth value={formData.nom} onChange={handleChange} /></Grid>
          <Grid item xs={12} md={6}><TextField label="Prénom" name="prenom" fullWidth value={formData.prenom} onChange={handleChange} /></Grid>
          
          <Grid item xs={12} md={6}>
            <TextField select label="Filière" name="filiere" fullWidth value={formData.filiere} onChange={handleChange}>
              {options.filieres.map(f => (
                <MenuItem key={f.id} value={f.id}>{f.nom_filiere}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField 
                select 
                label="Année Académique" 
                name="annee_academique" 
                fullWidth 
                value={formData.annee_academique} 
                onChange={handleChange}
                helperText={!etudiantData ? "Seules les années ouvertes sont affichées" : ""}
            >
              {options.annees.map(a => (
                <MenuItem key={a.id} value={a.id} disabled={etudiantData && a.statut === "INACTIVE"}>
                  {a.libelle} {a.statut === "INACTIVE" ? "(Clôturée)" : ""}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}><TextField label="Téléphone" name="telephone" fullWidth value={formData.telephone} onChange={handleChange} /></Grid>
          <Grid item xs={12} md={6}><TextField label="Tuteur" name="tuteur_nom" fullWidth value={formData.tuteur_nom} onChange={handleChange} /></Grid>
          
          <Grid item xs={12}>
            <TextField 
              select label="Statut administratif" name="is_active" fullWidth 
              value={formData.is_active} onChange={handleChange}
            >
              <MenuItem value={true}>Compte Actif (Inscrit)</MenuItem>
              <MenuItem value={false}>Compte Inactif (Archivé / Quitté)</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
        <Button onClick={onClose} color="inherit">Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" color={etudiantData ? "warning" : "primary"}>
          {etudiantData ? "Soumettre modifications" : "Confirmer l'inscription"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

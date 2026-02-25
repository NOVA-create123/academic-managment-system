import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { AuthProvider } from "./context/Authcontext";
import DossierEtudiant from "./pages/dossier/DossierEtudiant";
import Filieres from "./pages/referentiels/Filieres";
import Annees from "./pages/referentiels/Annees";
import Etudiants from "./pages/etudiants/Etudiants";
import ValidationModifications from "./pages/modifications/ValidationModifications";
import Users from "./pages/users/Users";
import MesPropositions from "./pages/modifications/MesPropositions";
import Historique from "./pages/modifications/Historique";
import Dashboard from "./pages/dashboard/Dashboard";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/referentiels/filieres" element={<Filieres />} />
          <Route path="/referentiels/annees" element={<Annees />} />
          <Route path="/etudiants" element={<Etudiants />} />
          <Route path="/modifications" element={<ValidationModifications />} />
          <Route path="/dossier/:id" element={<DossierEtudiant />} />
          <Route path="/users" element={<Users />} />
          <Route path="/mes-propositions" element={<MesPropositions />} />
          <Route path="/historique" element={<Historique />} />
          

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

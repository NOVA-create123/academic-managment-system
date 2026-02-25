import { useContext } from "react";
import { Typography } from "@mui/material";
import DashboardLayout from "../../layouts/DashboardLayout";
import { AuthContext } from "../../context/Authcontext";
import AdminDashboard from "./components/AdminDashboard";
import ScolariteDashboard from "./components/ScolariteDashboard";
import  ConsultationDashboard from "./components/ConsultationDashboard";

export default function Dashboard() {

  const { user } = useContext(AuthContext);

  const groups = user?.groups || [];

  const isAdmin = groups.includes("ADMIN");
  const isScolarite = groups.includes("SCOLARITE");
  const isConsultation = groups.includes("CONSULTATION");
  return (
    <DashboardLayout>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Tableau de bord
      </Typography>

      {isAdmin && <AdminDashboard />}
      {isScolarite && <ScolariteDashboard />}
      {isConsultation && <ConsultationDashboard />}

    </DashboardLayout>
  );
}

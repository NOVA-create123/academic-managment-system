import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemText, IconButton, Menu, MenuItem,
  ListItemIcon, Divider, Avatar, Container
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { 
  Dashboard, People, Rule, PostAdd, AccountTree, 
  CalendarMonth, ManageAccounts, History, Logout 
} from "@mui/icons-material";
import { useContext, useState } from "react";
import { AuthContext } from "../context/Authcontext";

const drawerWidth = 280;

const themeColors = {
  sidebarBg: "#1e293b", 
  sidebarText: "#cbd5e1",
  activeBg: "rgba(59, 130, 246, 0.15)",
  activeText: "#60a5fa",
  contentBg: "#f8fafc"
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();

  const open = Boolean(anchorEl);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const userGroups = Array.isArray(user?.groups)
    ? user.groups.map(g => g.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    : [];

  const isAdmin = userGroups.includes("ADMIN");
  const isScolarite = userGroups.includes("SCOLARITE");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      
      {/* ================= TOPBAR ================= */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 1201, 
          backgroundColor: "rgba(255, 255, 255, 0.9)", 
          backdropFilter: "blur(8px)",
          color: "#334155", 
          boxShadow: "none",
          borderBottom: "1px solid #e2e8f0" 
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box 
               component="img"
               src="/logo.png" 
               alt="Logo ENSPD"
               sx={{ height: 50, width: "auto" }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em" }}>
               <span style={{ color: "#3b82f6" }}>ENSPD</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1e293b", lineHeight: 1.2 }}>
                {user?.username}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                {userGroups[0] || "UTILISATEUR"}
              </Typography>
            </Box>
            <IconButton onClick={handleMenu} sx={{ p: 0.5, border: "2px solid #e2e8f0" }}>
              <Avatar sx={{ width: 35, height: 35, bgcolor: "#3b82f6", fontWeight: 700, fontSize: 14 }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{ elevation: 3, sx: { width: 220, mt: 1.5, borderRadius: 2 } }}>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2">{user?.username}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={logout} sx={{ color: 'error.main', mx: 1, my: 0.5, borderRadius: 1.5 }}>
                <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                <Typography variant="body2" fontWeight={600}>Déconnexion</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ================= SIDEBAR ================= */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { 
            width: drawerWidth, 
            boxSizing: "border-box", 
            border: "none", 
            backgroundColor: themeColors.sidebarBg,
            color: themeColors.sidebarText
          }
        }}
      >
        <Toolbar sx={{ mb: 2 }} />
        <Box sx={{ overflow: "auto", px: 2 }}>
          <List sx={{ "& .MuiListItemButton-root": { borderRadius: 2, mb: 0.8, py: 1.2 } }}>
            
            <Typography variant="caption" sx={{ px: 2, fontWeight: 700, color: "#475569", textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>
              Menu Principal
            </Typography>
            
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard" selected={location.pathname === "/dashboard"}
                sx={{ "&.Mui-selected": { backgroundColor: themeColors.activeBg, color: themeColors.activeText } }}>
                <ListItemIcon sx={{ color: location.pathname === "/dashboard" ? themeColors.activeText : "inherit", minWidth: 40 }}><Dashboard /></ListItemIcon>
                <ListItemText primary="Tableau de bord" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/etudiants" selected={location.pathname === "/etudiants"}
                sx={{ "&.Mui-selected": { backgroundColor: themeColors.activeBg, color: themeColors.activeText } }}>
                <ListItemIcon sx={{ color: location.pathname === "/etudiants" ? themeColors.activeText : "inherit", minWidth: 40 }}><People /></ListItemIcon>
                <ListItemText primary="Gestion Étudiants" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>

            {/* --- Après Gestion Étudiants --- */}
            {isScolarite && (
              <ListItem disablePadding>
                <ListItemButton 
                  component={Link} 
                  to="/mes-propositions" 
                  selected={location.pathname === "/mes-propositions"}
                  sx={{ "&.Mui-selected": { backgroundColor: themeColors.activeBg, color: themeColors.activeText } }}
                >
                  <ListItemIcon sx={{ color: location.pathname === "/mes-propositions" ? themeColors.activeText : "inherit", minWidth: 40 }}>
                    <PostAdd />
                  </ListItemIcon>
                  <ListItemText primary="Mes propositions" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            )}

            {isAdmin && (
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/modifications" selected={location.pathname === "/modifications"}
                  sx={{ "&.Mui-selected": { backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" } }}>
                  <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><Rule /></ListItemIcon>
                  <ListItemText primary="Validations" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            )}

            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.05)" }} />
            
            <Typography variant="caption" sx={{ px: 2, fontWeight: 700, color: "#475569", textTransform: "uppercase", fontSize: 11 }}>
              Paramétrage
            </Typography>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/referentiels/filieres" selected={location.pathname === "/referentiels/filieres"}>
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><AccountTree /></ListItemIcon>
                <ListItemText primary="Filières" primaryTypographyProps={{ fontSize: 14 }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/referentiels/annees" selected={location.pathname === "/referentiels/annees"}>
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><CalendarMonth /></ListItemIcon>
                <ListItemText primary="Années" primaryTypographyProps={{ fontSize: 14 }} />
              </ListItemButton>
            </ListItem>

            {isAdmin && (
              <>
                <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.05)" }} />
                <Typography variant="caption" sx={{ px: 2, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", fontSize: 11 }}>
                  Administration
                </Typography>
                
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/users" selected={location.pathname === "/users"}>
                    <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><ManageAccounts /></ListItemIcon>
                    <ListItemText primary="Comptes Utilisateurs" primaryTypographyProps={{ fontSize: 14 }} />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/historique" selected={location.pathname === "/historique"}>
                    <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><History /></ListItemIcon>
                    <ListItemText primary="Historique des actions" primaryTypographyProps={{ fontSize: 14 }} />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* ================= CONTENU & FOOTER ================= */}
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", bgcolor: themeColors.contentBg, minHeight: "100vh" }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8, flexGrow: 1 }}>
          {children}
        </Container>

        <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: "#fff", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            © {new Date().getFullYear()} <span style={{ color: "#3b82f6" }}>ENSPD - Master Data Management</span>. Tous droits réservés.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

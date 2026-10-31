import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography
} from "@mui/material";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; 
import PeopleIcon from "@mui/icons-material/People"; 
import PublicIcon from '@mui/icons-material/Public'; // User Panel Icon
import LogoutIcon from "@mui/icons-material/Logout";
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';

import { signOut } from "firebase/auth";
// FIXED: Changed "../firebase" to "./firebase"
import { auth } from "./firebase"; 

const drawerWidth = 260;

export default function SideBar() {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "#ffffff"
        }
      }}
    >
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 3 }}>
         <LocalPharmacyIcon color="primary" />
         <Typography variant="h6" fontWeight={700} color="#1e293b">
            FairDose
         </Typography>
      </Toolbar>
      
      <Divider />

      <Box sx={{ overflow: "auto", display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List sx={{ p: 2 }}>
          {/* DASHBOARD LINK */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
                selected={true} 
                sx={{ borderRadius: 2, bgcolor: '#eff6ff', '&.Mui-selected': { bgcolor: '#eff6ff' } }}
            >
              <ListItemIcon>
                <DashboardIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600, color: '#2563eb' }} />
            </ListItemButton>
          </ListItem>

          {/* PLACEHOLDERS */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItemButton>
          </ListItem>
          
           <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
          </ListItem>
        </List>

        <Box sx={{ flexGrow: 1 }} />
        <Divider sx={{ mx: 2 }} />

        <List sx={{ p: 2 }}>
          {/* USER PANEL LINK */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
                component="a" 
                href="https://fairdose.vercel.app" 
                target="_blank"
                sx={{ 
                    borderRadius: 2, 
                    border: '1px solid #e2e8f0',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                }}
            >
              <ListItemIcon>
                <PublicIcon color="success" /> 
              </ListItemIcon>
              <ListItemText 
                primary="User Panel" 
                secondary="Live Website" 
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>

          {/* LOGOUT */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: '#ef4444' }}>
              <ListItemIcon>
                <LogoutIcon sx={{ color: '#ef4444' }} />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
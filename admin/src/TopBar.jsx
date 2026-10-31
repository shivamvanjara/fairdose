import { AppBar, Toolbar, Typography, Box, Avatar, IconButton } from "@mui/material";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

// Must match sidebar width to align correctly
const drawerWidth = 260; 

export default function TopBar() {
  return (
    <AppBar
      position="fixed"
      elevation={0} 
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: "#f5f7fb", 
        borderBottom: "1px solid transparent", 
        color: "#1e293b"
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* PAGE BREADCRUMB */}
        <Box>
          <Typography variant="body2" color="text.secondary">
             Admin Panel / <span style={{color: "#2563eb", fontWeight: 600}}>Overview</span>
          </Typography>
        </Box>

        {/* PROFILE SECTION */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton size="small">
            <NotificationsNoneIcon color="action" />
          </IconButton>
          
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1.5, 
            bgcolor: "white", 
            p: 0.5, 
            pr: 2, 
            borderRadius: 50, 
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)" 
          }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#2563eb", fontSize: 14 }}>
              A
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                Admin User
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                Super Admin
              </Typography>
            </Box>
          </Box>
        </Box>

      </Toolbar>
    </AppBar>
  );
}
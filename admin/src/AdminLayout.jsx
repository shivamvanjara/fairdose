import { Box } from "@mui/material";
import TopBar from "./TopBar";
import SideBar from "./SideBar";

export default function AdminLayout({ children }) {
  return (
    <Box sx={{ display: "flex" }}>
      <SideBar />

      <Box sx={{ flexGrow: 1 }}>
        <TopBar />
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}

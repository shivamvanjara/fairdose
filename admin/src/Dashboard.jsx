import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

// UI Components
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  Paper,
  IconButton,
  Divider,
  Container,
  Tooltip
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MedicationIcon from "@mui/icons-material/Medication";
import CategoryIcon from "@mui/icons-material/Category";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import FilterListIcon from "@mui/icons-material/FilterList";

import AlternativeList from "./AlternativeList";
import AddMedicineDialog from "./AddMedicineDialog";
import ConfirmDialog from "./components/ConfirmDialog"; // Ensure path is correct based on your folder structure
import AppSnackbar from "./components/AppSnackbar";     // Ensure path is correct based on your folder structure

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [addMedicineOpen, setAddMedicineOpen] = useState(false);
  const [deleteMed, setDeleteMed] = useState(null);
  const [loading, setLoading] = useState(true);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [summary, setSummary] = useState({
    medicines: 0,
    categories: 0,
    alternatives: 0
  });

  const [activity, setActivity] = useState({
    medicineAdded: 0,
    medicineDeleted: 0,
    alternativeAdded: 0,
    lastAction: "Logged in"
  });

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "medicine_data"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setMedicines(data);

      const categories = new Set(data.map((m) => m.category));
      const alternativesCount = data.reduce(
        (sum, m) => sum + (m.alternatives?.length || 0),
        0
      );

      setSummary({
        medicines: data.length,
        categories: categories.size,
        alternatives: alternativesCount
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  if (loading) return null;

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.category.toLowerCase().includes(search.toLowerCase()) ||
      med.salt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "" || med.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // --- SUB-COMPONENT: STAT CARD ---
  const StatCard = ({ title, value, icon, color }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: "flex",
        alignItems: "center",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background: `linear-gradient(135deg, #fff 0%, ${color}15 100%)`,
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
             transform: "translateY(-4px)",
             boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: "12px",
          bgcolor: `${color}20`,
          color: color,
          mr: 2,
          display: "flex"
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {value}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 1. HEADER SECTION */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1e293b">
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview & Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setAddMedicineOpen(true)}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.2,
            textTransform: "none",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
          }}
        >
          Add New Medicine
        </Button>
      </Box>

      {/* 2. STATS OVERVIEW - FIXED SPACING HERE */}
      {/* Increased mb (margin-bottom) from 4 to 6 for better spacing */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Medicines"
            value={summary.medicines}
            icon={<MedicationIcon fontSize="large" />}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Active Categories"
            value={summary.categories}
            icon={<CategoryIcon fontSize="large" />}
            color="#059669"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Alternatives"
            value={summary.alternatives}
            icon={<ShuffleIcon fontSize="large" />}
            color="#d97706"
          />
        </Grid>
      </Grid>

      {/* 3. SEARCH & FILTER BAR */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <TextField
          placeholder="Search medicine or salt..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: "250px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />

        <TextField
          select
          size="small"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" color="action" />
              </InputAdornment>
            )
          }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {[...new Set(medicines.map((m) => m.category))].map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* 4. MEDICINE GRID */}
      <Grid container spacing={3} alignItems="stretch">
        {filteredMedicines.map((med, index) => (
          <Grid 
            item 
            xs={12} sm={6} md={4} lg={4} 
            key={med.id} 
            sx={{ display: 'flex' }}
            className="stagger-enter"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Card
              elevation={0}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 3, 
                  borderColor: "primary.light"
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={med.category}
                    size="small"
                    sx={{
                      bgcolor: "#eff6ff",
                      color: "#2563eb",
                      fontWeight: 600,
                      borderRadius: "6px"
                    }}
                  />
                </Box>

                <Tooltip title={med.salt} placement="top">
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 0.5, 
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      minHeight: '2.6em' 
                    }}
                  >
                    {med.salt}
                  </Typography>
                </Tooltip>
                
                <Typography variant="body2" color="text.secondary">
                  Active Salt Composition
                </Typography>
              </CardContent>

              <Divider />
              
              <Box sx={{ p: 2, display: "flex", gap: 1, mt: "auto", bgcolor: "#fafafa" }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setSelectedMed(med)}
                  sx={{ 
                    borderColor: "#e2e8f0", 
                    color: "#475569",
                    textTransform: "none",
                    "&:hover": { borderColor: "#2563eb", color: "#2563eb", bgcolor: "#eff6ff" }
                  }}
                >
                  Details
                </Button>
                
                <IconButton 
                   size="small" 
                   onClick={() => setDeleteMed(med)}
                   sx={{ 
                     color: "#ef4444",
                     bgcolor: "#fef2f2", 
                     borderRadius: 1,
                     border: "1px solid #fee2e2",
                     "&:hover": { bgcolor: "#fee2e2", borderColor: "#fecaca" }
                   }}
                >
                   <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DIALOGS */}
      <Dialog
        open={Boolean(selectedMed)}
        onClose={() => setSelectedMed(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #eee", px: 3, py: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {selectedMed?.salt}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedMed?.category}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedMed && (
            <AlternativeList
              med={selectedMed}
              refresh={fetchMedicines}
            />
          )}
        </DialogContent>
      </Dialog>

      <AddMedicineDialog
        open={addMedicineOpen}
        close={() => setAddMedicineOpen(false)}
        refresh={fetchMedicines}
        onAdded={() =>
          setActivity((prev) => ({
            ...prev,
            medicineAdded: prev.medicineAdded + 1,
            lastAction: "Medicine added"
          }))
        }
      />

      <ConfirmDialog
        open={Boolean(deleteMed)}
        title={`Delete ${deleteMed?.salt}?`}
        onClose={() => setDeleteMed(null)}
        onConfirm={async () => {
          await deleteDoc(doc(db, "medicine_data", deleteMed.id));
          setDeleteMed(null);
          fetchMedicines();
          setActivity((prev) => ({
            ...prev,
            medicineDeleted: prev.medicineDeleted + 1,
            lastAction: "Medicine deleted"
          }));
          setSnack({
            open: true,
            message: "Medicine deleted successfully",
            severity: "success"
          });
        }}
      />

      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={() => setSnack({ ...snack, open: false })}
      />
    </Container>
  );
}
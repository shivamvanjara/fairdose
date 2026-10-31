import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Grow
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "./firebase";
import EditAlternativeDialog from "./EditAlternativeDialog";
import AddAlternativeDialog from "./AddAlternativeDialog";

export default function AlternativeList({ med, refresh }) {
  const [editingAlt, setEditingAlt] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = async (altToDelete) => {
    const altName = altToDelete.name || altToDelete.Brand || "this item";
    if (!window.confirm(`Delete ${altName}?`)) return;

    try {
      const medRef = doc(db, "medicine_data", med.id);
      await updateDoc(medRef, {
        alternatives: arrayRemove(altToDelete)
      });
      refresh();
    } catch (error) {
      console.error("Error deleting alternative:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3
        }}
      >
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 700
          }}
        >
          <AutoAwesomeIcon color="primary" />
          Registered Alternatives
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setIsAddOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Add Alternative
        </Button>
      </Box>

      {/* LIST */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        {med.alternatives && med.alternatives.length > 0 ? (
          med.alternatives.map((alt, index) => (
            <Grow in={true} timeout={(index + 1) * 150} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  transition: "all 0.2s",
                  minHeight: 88,
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "#f8fafc",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }
                }}
              >
                {/* 🔥 GRID LOCKED LAYOUT */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "5fr 4fr 3fr"
                    },
                    alignItems: "center",
                    columnGap: 2
                  }}
                >
                  {/* LEFT — MEDICINE NAME */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color="#1e293b"
                      noWrap
                    >
                      {alt.name || alt.Brand || alt.brand || "Unknown Name"}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={0.5}>
                      <Chip
                        label={`₹${alt.price || alt.Price || "0"}`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                      <Chip
                        label={alt.type || alt.Type || "Generic"}
                        size="small"
                        sx={{ bgcolor: "#f1f5f9" }}
                      />
                    </Stack>
                  </Box>

                  {/* CENTER — MANUFACTURER */}
                  <Box sx={{ justifySelf: "center" }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 14 }} color="action" />
                      Manufacturer
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#334155">
                      {alt.manufacturer ||
                        alt.MFG ||
                        alt.mfg ||
                        "Unknown"}
                    </Typography>
                  </Box>

                  {/* RIGHT — ACTIONS */}
                  <Box sx={{ justifySelf: "end" }}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => setEditingAlt({ alt, index })}
                          sx={{
                            color: "primary.main",
                            bgcolor: "#eff6ff",
                            border: "1px solid #dbeafe",
                            borderRadius: 1,
                            "&:hover": { bgcolor: "#dbeafe" }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(alt)}
                          sx={{
                            color: "#ef4444",
                            bgcolor: "#fef2f2",
                            border: "1px solid #fee2e2",
                            borderRadius: 1,
                            "&:hover": { bgcolor: "#fee2e2" }
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Box>
              </Paper>
            </Grow>
          ))
        ) : (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: "#f8fafc",
              borderRadius: 2,
              border: "1px dashed #cbd5e1"
            }}
          >
            <Typography color="text.secondary">
              No alternatives found.
            </Typography>
            <Button size="small" sx={{ mt: 1 }} onClick={() => setIsAddOpen(true)}>
              Add one now
            </Button>
          </Box>
        )}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* DIALOGS */}
      {editingAlt && (
        <EditAlternativeDialog
          open
          handleClose={() => setEditingAlt(null)}
          altData={editingAlt.alt}
          index={editingAlt.index}
          medId={med.id}
          refresh={refresh}
        />
      )}

      {isAddOpen && (
        <AddAlternativeDialog
          open
          handleClose={() => setIsAddOpen(false)}
          medId={med.id}
          refresh={refresh}
        />
      )}
    </Box>
  );
}

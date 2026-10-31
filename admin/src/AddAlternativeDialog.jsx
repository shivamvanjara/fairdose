import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid
} from "@mui/material";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebase";

export default function AddAlternativeDialog({ open, handleClose, medId, refresh }) {
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    price: "",
    type: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      alert("Please fill in at least Name and Price");
      return;
    }

    setLoading(true);
    try {
      const medRef = doc(db, "medicine_data", medId);
      
      // Add the new alternative to the array
      await updateDoc(medRef, {
        alternatives: arrayUnion(formData)
      });

      refresh(); // Reload the list
      handleClose(); // Close the dialog
      setFormData({ name: "", manufacturer: "", price: "", type: "" }); // Reset form
    } catch (error) {
      console.error("Error adding alternative:", error);
      alert("Failed to add alternative");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Add New Alternative</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Medicine Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dolo 650"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              placeholder="e.g. Micro Labs"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Price (₹)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
             <TextField
              fullWidth
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="e.g. Generic / Premium"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? "Adding..." : "Add Alternative"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid
} from "@mui/material";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function EditAlternativeDialog({ open, handleClose, altData, index, medId, refresh }) {
  // Initialize with fallback for both Capitalized and lowercase keys
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    price: "",
    type: ""
  });

  useEffect(() => {
    if (altData) {
      setFormData({
        name: altData.name || altData.Brand || "",
        manufacturer: altData.manufacturer || altData.MFG || "",
        price: altData.price || altData.Price || "",
        type: altData.type || altData.Type || "Value"
      });
    }
  }, [altData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const medRef = doc(db, "medicine_data", medId);
      const medSnap = await getDoc(medRef);

      if (medSnap.exists()) {
        const data = medSnap.data();
        const alternatives = data.alternatives || [];
        
        // Update the specific index
        alternatives[index] = formData;

        await updateDoc(medRef, { alternatives });
        refresh();
        handleClose();
      }
    } catch (error) {
      console.error("Error updating alternative:", error);
      alert("Failed to update");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Alternative</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Medicine Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Price"
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
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
}
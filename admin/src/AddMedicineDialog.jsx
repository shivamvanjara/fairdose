import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from "@mui/material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export default function AddMedicineDialog({ open, close, refresh }) {
  const [category, setCategory] = useState("");
  const [salt, setSalt] = useState("");

  const [cdscoApproved, setCdscoApproved] = useState(false);
  const [gmpCertified, setGmpCertified] = useState(false);

  const [loading, setLoading] = useState(false);

  const isValid =
    category.trim() !== "" &&
    salt.trim() !== "" &&
    cdscoApproved &&
    gmpCertified;

  const handleAdd = async () => {
    if (!cdscoApproved || !gmpCertified) {
      alert("Please confirm CDSCO and GMP compliance");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "medicine_data"), {
        category: category.trim(),
        salt: salt.trim(),

        cdscoApproved: true,
        gmpCertified: true,

        alternatives: [],
        createdAt: serverTimestamp()
      });

      refresh();
      close();

      // reset form
      setCategory("");
      setSalt("");
      setCdscoApproved(false);
      setGmpCertified(false);
    } catch (err) {
      console.error("Error adding medicine:", err);
      alert("Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Add Medicine</DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <TextField
          label="Category"
          fullWidth
          margin="dense"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <TextField
          label="Salt"
          fullWidth
          margin="dense"
          value={salt}
          onChange={(e) => setSalt(e.target.value)}
          required
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={cdscoApproved}
              onChange={(e) => setCdscoApproved(e.target.checked)}
            />
          }
          label="This medicine is approved by CDSCO"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={gmpCertified}
              onChange={(e) => setGmpCertified(e.target.checked)}
            />
          }
          label="Manufacturer follows GMP standards"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={close} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!isValid || loading}
        >
          {loading ? <CircularProgress size={20} /> : "Add Medicine"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

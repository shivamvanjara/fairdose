import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  Stack,
  Container
} from "@mui/material";

// Icons for a premium feel
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';

export default function Login({ onLogin }) {
  // ==========================================
  //  LOGIC SECTION (UNTOUCHED)
  // ==========================================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);
    await onLogin({ email, password });
    setLoading(false);
  };
  // ==========================================
  //  END LOGIC SECTION
  // ==========================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // Premium subtle gradient background
        background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 3,
        px: 2
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 4,
            bgcolor: "rgba(255, 255, 255, 0.9)", // Glass-like feel
            backdropFilter: "blur(10px)",
            border: "1px solid",
            borderColor: "rgba(255, 255, 255, 0.6)",
            boxShadow: "0 20px 40px -10px rgba(37, 99, 235, 0.1)"
          }}
        >
          {/* LOGO ICON */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              boxShadow: "0 8px 16px rgba(37, 99, 235, 0.25)"
            }}
          >
            <LocalPharmacyIcon sx={{ color: "white", fontSize: 30 }} />
          </Box>

          {/* HEADINGS */}
          <Typography variant="h5" fontWeight={800} color="#1e293b" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Enter your credentials to access the admin panel.
          </Typography>

          {/* FORM FIELDS */}
          <Stack spacing={2.5} width="100%">
            <TextField
              fullWidth
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "&.Mui-focused fieldset": { borderColor: "#2563eb" }
                }
              }}
            />

            <TextField
              fullWidth
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "&.Mui-focused fieldset": { borderColor: "#2563eb" }
                }
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                py: 1.5,
                mt: 1,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 16px rgba(37, 99, 235, 0.3)"
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </Stack>

          {/* FOOTER */}
          <Typography variant="caption" color="text.disabled" sx={{ mt: 4 }}>
            © 2025 FairDose Admin Portal
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
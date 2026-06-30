import { useEffect, useState } from "react";
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActionArea,
  CircularProgress, Alert, Chip, Divider,
} from "@mui/material";
import VerifiedRoundedIcon         from "@mui/icons-material/VerifiedRounded";
import BadgeRoundedIcon            from "@mui/icons-material/BadgeRounded";
import SupportAgentRoundedIcon     from "@mui/icons-material/SupportAgentRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import WarningAmberRoundedIcon     from "@mui/icons-material/WarningAmberRounded";
import { useNavigate }             from "react-router-dom";
import AppLayout                   from "../../components/AppLayout";
import complianceService           from "../../services/complianceService";
import { brand }                   from "../../theme";

function SummaryCard({ title, icon, color, bg, items, onClick }) {
  return (
    <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderLeft: `4px solid ${color}`, cursor: "pointer" }}
      onClick={onClick}>
      <CardContent sx={{ pb: "16px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color }}>
            {icon}
          </Box>
          <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
        </Box>
        {items.map((item, i) => (
          <Box key={i} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">{item.label}</Typography>
            <Chip label={item.value} size="small"
              color={item.alert ? "error" : item.warn ? "warning" : "default"}
              sx={{ fontWeight: 700, minWidth: 36 }} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ComplianceDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    complianceService.adminComplianceDashboard()
      .then(setData)
      .catch(e => setError(e?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <VerifiedRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" fontWeight={800}>Compliance Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              FSSAI · KYC · Grievances · Settlements
            </Typography>
          </Box>
        </Box>

        {loading && <Box sx={{ textAlign: "center", py: 6 }}><CircularProgress sx={{ color: brand.orange }} /></Box>}
        {error   && <Alert severity="error">{error}</Alert>}

        {data && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="FSSAI Licenses" icon={<VerifiedRoundedIcon fontSize="small" />}
                color="#2E7D32" bg="#E8F5E9"
                onClick={() => nav("/admin/fssai")}
                items={[
                  { label: "Pending review",  value: data.fssai.pending_review,  alert: data.fssai.pending_review > 0 },
                  { label: "Expiring ≤60 days", value: data.fssai.expiring_soon, warn: data.fssai.expiring_soon > 0 },
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Caterer KYC" icon={<BadgeRoundedIcon fontSize="small" />}
                color="#1565C0" bg="#E3F2FD"
                onClick={() => nav("/admin/kyc")}
                items={[
                  { label: "Pending review", value: data.kyc.pending_review, alert: data.kyc.pending_review > 0 },
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Grievances" icon={<SupportAgentRoundedIcon fontSize="small" />}
                color="#C62828" bg="#FFEBEE"
                onClick={() => nav("/admin/grievances")}
                items={[
                  { label: "Open",       value: data.grievances.open_count,        alert: +data.grievances.open_count > 0 },
                  { label: "Escalated",  value: data.grievances.escalated_count,   alert: +data.grievances.escalated_count > 0 },
                  { label: "In progress",value: data.grievances.in_progress_count  },
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Settlements" icon={<AccountBalanceWalletRoundedIcon fontSize="small" />}
                color="#6A1B9A" bg="#F3E5F5"
                onClick={() => nav("/admin/settlements")}
                items={[
                  { label: "Pending payouts", value: data.settlements.pending_count, warn: +data.settlements.pending_count > 0 },
                  { label: "Amount due (₹)",  value: Number(data.settlements.pending_amount).toLocaleString("en-IN") },
                ]}
              />
            </Grid>

            {data.fssai.expiring_details?.length > 0 && (
              <Grid size={12}>
                <Card elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <WarningAmberRoundedIcon sx={{ color: "#F57F17" }} />
                      <Typography fontWeight={700}>FSSAI Licenses Expiring Soon</Typography>
                    </Box>
                    {data.fssai.expiring_details.map((f) => {
                      const days = Math.ceil((new Date(f.expiry_date) - new Date()) / 86400000);
                      return (
                        <Box key={f.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1 }}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{f.caterer_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{f.fssai_number} · {f.caterer_email}</Typography>
                          </Box>
                          <Chip
                            label={`${days}d left`}
                            size="small"
                            color={days <= 7 ? "error" : days <= 30 ? "warning" : "default"}
                            sx={{ fontWeight: 700 }}
                          />
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </AppLayout>
  );
}

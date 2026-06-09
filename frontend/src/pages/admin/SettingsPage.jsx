import {
  Container, Box, Typography, Card, CardContent, List,
  ListItem, ListItemText, ListItemIcon, Divider,
} from "@mui/material";
import SettingsRoundedIcon          from "@mui/icons-material/SettingsRounded";
import SecurityRoundedIcon          from "@mui/icons-material/SecurityRounded";
import StorageRoundedIcon           from "@mui/icons-material/StorageRounded";
import InfoRoundedIcon              from "@mui/icons-material/InfoRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";

const SETTINGS = [
  { icon: <InfoRoundedIcon />,      primary: "Platform Version", secondary: "PO.PU v1.0.0 — pure · fresh · trusted" },
  { icon: <SecurityRoundedIcon />,  primary: "Authentication",   secondary: "JWT-based, 7-day token expiry" },
  { icon: <StorageRoundedIcon />,   primary: "Database",         secondary: "PostgreSQL 16 with pgcrypto, pg_trgm" },
];

export default function SettingsPage() {
  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <SettingsRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Settings</Typography>
        </Box>

        <Card elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
          <CardContent sx={{ p: 0 }}>
            <List disablePadding>
              {SETTINGS.map((s, i) => (
                <Box key={s.primary}>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemIcon sx={{ color: brand.orange, minWidth: 40 }}>{s.icon}</ListItemIcon>
                    <ListItemText
                      primary={s.primary}
                      secondary={s.secondary}
                      primaryTypographyProps={{ fontWeight: 700 }}
                    />
                  </ListItem>
                  {i < SETTINGS.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>
    </AppLayout>
  );
}

"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { ColorModeContext } from "../providers";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum;
    if (eth?.selectedAddress) {
      setWallet(eth.selectedAddress);
    }
    const handleAccounts = (accounts: string[]) => {
      setWallet(accounts?.[0] ?? null);
    };
    eth?.on?.("accountsChanged", handleAccounts);
    return () => {
      eth?.removeListener?.("accountsChanged", handleAccounts);
    };
  }, []);

  return (
    <>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            MetaVerse NFT
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
            <Button component={Link} href="/" color="inherit">Home</Button>
            <Button component={Link} href="/create-nft" color="inherit">Create</Button>
            <Button component={Link} href="/my-nfts" color="inherit">My NFTs</Button>
            <Button component={Link} href="/creator-dashboard" color="inherit">Dashboard</Button>
          </Box>
          <Tooltip title="Wishlist">
            <IconButton component={Link} href="/?wishlist=1" color="inherit">
              <FavoriteBorderIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Profile">
            <IconButton onClick={() => setProfileOpen(true)} color="inherit">
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>

      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Profile</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar sx={{ width: 56, height: 56 }}>U</Avatar>
            <Box>
              <Typography variant="h6">User</Typography>
              <Typography variant="body2" color="text.secondary">
                {wallet ? `Wallet: ${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Wallet not connected"}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label="Collector" color="primary" variant="outlined" />
            <Chip label="Creator" color="secondary" variant="outlined" />
            <Chip label="Verified" variant="outlined" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

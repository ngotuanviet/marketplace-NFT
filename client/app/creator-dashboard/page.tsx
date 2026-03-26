"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";
import { contractAddress } from "../../config";
import NFTMarketplace from "../../abi/NFTMarketplace.json";
import { NFT } from "../../types";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Pagination,
  Stack,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Skeleton,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { getWishlist, toggleWishlist } from "../lib/wishlist";

const ITEMS_PER_PAGE = 8;

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "info" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    setWishlist(getWishlist());
  }, []);

  const resolveTokenUri = (uri: string) => {
    if (!uri) return uri;
    if (uri.startsWith("ipfs://")) {
      const clean = uri.replace("ipfs://", "").replace(/^ipfs\//, "");
      return `https://gateway.pinata.cloud/ipfs/${clean}`;
    }
    return uri;
  };

  const fetchMetadata = async (uri: string) => {
    const res = await axios.get(`/api/metadata?url=${encodeURIComponent(uri)}`);
    return res.data;
  };

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.BrowserProvider(connection);
    const getnetwork = await provider.getNetwork();

    const sepoliaChainId = 11155111;
    const goerliChainId = 5;
    const localChainId = 31337;

    if (
      Number(getnetwork.chainId) !== sepoliaChainId &&
      Number(getnetwork.chainId) !== goerliChainId &&
      Number(getnetwork.chainId) !== localChainId
    ) {
      setToast({
        open: true,
        message: "Vui lòng đợi sang Sepolia, Goerli hoặc Localhost",
        severity: "info",
      });
      return;
    }

    const signer = await provider.getSigner();
    const marketplaceContract = new ethers.Contract(contractAddress, NFTMarketplace.abi, signer);
    const data = await marketplaceContract.fetchItemsListed();

    const items = await Promise.all(
      data.map(async (i: NFT) => {
        const tokenURI = await marketplaceContract.tokenURI(i.tokenId);
        const resolvedUri = resolveTokenUri(tokenURI);
        const meta = await fetchMetadata(resolvedUri).catch(() => null);
        if (!meta) return null;
        const price = ethers.formatUnits(i.price.toString(), "ether");
        return {
          price,
          tokenId: Number(i.tokenId),
          seller: i.seller,
          owner: i.owner,
          image: resolveTokenUri(meta.image || ""),
          name: meta.name,
          description: meta.description ?? "",
          tokenURI,
        } as NFT;
      })
    );

    setNfts(items.filter(Boolean) as NFT[]);
    setLoadingState("loaded");
  }

  async function cancelListing(tokenId: any) {
    setLoadingState("not-loaded");
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.BrowserProvider(connection);
    const signer = await provider.getSigner();
    const marketplaceContract = new ethers.Contract(contractAddress, NFTMarketplace.abi, signer);
    const transaction = await marketplaceContract.cancelItemListing(tokenId);
    await transaction.wait();
    setToast({ open: true, message: "Ðã hủy niêm yết", severity: "success" });
    loadNFTs();
  }

  const isLoading = loadingState === "not-loaded";

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return nfts
      .filter((nft) => (!query ? true : `${nft.name} ${nft.description}`.toLowerCase().includes(query)))
      .filter((nft) => (status === "all" ? true : status === "listed"))
      .filter((nft) => (wishlistOnly ? wishlist.includes(nft.tokenId) : true));
  }, [nfts, search, status, wishlistOnly, wishlist]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => Number(a.price) - Number(b.price));
      case "price-desc":
        return list.sort((a, b) => Number(b.price) - Number(a.price));
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list;
    }
  }, [filtered, sort]);

  useEffect(() => {
    setPage(1);
  }, [search, status, sort, wishlistOnly]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleToggleWishlist = (tokenId: number) => {
    const next = toggleWishlist(tokenId);
    setWishlist(next);
    const isNow = next.includes(tokenId);
    setToast({
      open: true,
      message: isNow ? "Ðã thêm vào wishlist" : "Ðã bỏ khỏi wishlist",
      severity: "success",
    });
  };

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box>
        <Typography variant="h4">Creator Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Theo dõi NFT bán dang niêm yết.
        </Typography>
      </Box>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            placeholder="Tìm ki?m"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="listed">Ðang niêm yết</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Sort</InputLabel>
            <Select value={sort} label="Sort" onChange={(e) => setSort(e.target.value)}>
              <MenuItem value="recent">Mới nhất</MenuItem>
              <MenuItem value="price-asc">Giá tăng dần</MenuItem>
              <MenuItem value="price-desc">Giá giảm dần</MenuItem>
              <MenuItem value="name-asc">Tên A-Z</MenuItem>
              <MenuItem value="name-desc">Tên Z-A</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControlLabel
            control={<Switch checked={wishlistOnly} onChange={(e) => setWishlistOnly(e.target.checked)} />}
            label="Chỉ wishlist"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {isLoading &&
          Array.from({ length: 8 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={3} key={`skeleton-${idx}`}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton width="80%" />
                  <Skeleton width="60%" />
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Skeleton width={80} />
                  <Skeleton width={100} />
                </CardActions>
              </Card>
            </Grid>
          ))}

        {!isLoading && paged.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6">Không có NFT nào</Typography>
              <Typography variant="body2" color="text.secondary">
                Bạn chưa niêm yết NFT nào.
              </Typography>
            </Card>
          </Grid>
        )}

        {!isLoading &&
          paged.map((nft) => (
            <Grid item xs={12} sm={6} md={3} key={nft.tokenId}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Box component="img" src={nft.image} alt={nft.name} sx={{ width: "100%", height: 200, objectFit: "cover" }} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap>
                    {nft.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 40, overflow: "hidden" }}>
                    {nft.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                  <Typography variant="h6">{nft.price} ETH</Typography>
                  <Box>
                    <IconButton onClick={() => handleToggleWishlist(nft.tokenId)}>
                      {wishlist.includes(nft.tokenId) ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <Button variant="contained" color="secondary" onClick={() => cancelListing(nft.tokenId)}>
                      Cancel
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      <Stack direction="row" justifyContent="center">
        <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
      </Stack>

      <Snackbar open={toast.open} autoHideDuration={2400} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


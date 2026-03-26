"use client";

import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import Web3Modal from "web3modal";
import { contractAddress, PINATA_KEY, PINATA_SECRET } from "../../config";
import NFTMarketplace from "../../abi/NFTMarketplace.json";
import axios from "axios";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function CreateNFT() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [formInput, updateFormInput] = useState({ price: "", name: "", description: "" });
  const router = useRouter();
  const [loadingState, setLoadingState] = useState("not-loading");
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "info" }>({
    open: false,
    message: "",
    severity: "success",
  });

  async function imageUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: PINATA_KEY,
          pinata_secret_api_key: PINATA_SECRET,
          "Content-Type": "multipart/form-data",
        },
      });
      const imageURL = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      setFileUrl(imageURL);
      setToast({ open: true, message: "Upload ảnh thành công", severity: "success" });
    } catch (e) {
      setToast({ open: true, message: "Upload ảnh thất bại", severity: "info" });
    }
  }

  async function uploadToIPFS() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) {
      setToast({ open: true, message: "Vui lòng nhập đủ thông tin", severity: "info" });
      return;
    }

    setLoadingState("loading");
    try {
      const jsonData = JSON.stringify({
        pinataMetadata: { name: `${name}.json` },
        pinataContent: { name, description, image: fileUrl },
      });
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: jsonData,
        headers: {
          pinata_api_key: PINATA_KEY,
          pinata_secret_api_key: PINATA_SECRET,
          "Content-Type": "application/json",
        },
      });
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      return tokenURI;
    } catch (e) {
      setToast({ open: true, message: "Upload metadata thất bại", severity: "info" });
    } finally {
      setLoadingState("not-loading");
    }
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS();
    if (!url) return;

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
      setToast({ open: true, message: "Vui lòng đợi sang Sepolia/Goerli/Localhost", severity: "info" });
      return;
    }

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, NFTMarketplace.abi, signer);
    const price = ethers.parseUnits(formInput.price, "ether");
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    const transaction = await contract.createToken(url, price, { value: listingPrice });
    await transaction.wait();

    setToast({ open: true, message: "Tạo NFT thành công", severity: "success" });
    router.push("/");
  }

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box>
        <Typography variant="h4">Create NFT</Typography>
        <Typography variant="body2" color="text.secondary">
          Tạo NFT mới và dang bán ngay.
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Tên NFT"
            value={formInput.name}
            onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Nội dung"
            value={formInput.description}
            onChange={(e) => updateFormInput({ ...formInput, description: e.target.value })}
            multiline
            minRows={4}
            fullWidth
          />
          <TextField
            label="Price (ETH)"
            type="number"
            value={formInput.price}
            onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
            fullWidth
          />
          <Button variant="outlined" component="label">
            Đẩy ảnh
            <input hidden accept=".png,.jpg,.jpeg" type="file" onChange={imageUpload} />
          </Button>

          {fileUrl && (
            <Box
              component="img"
              src={fileUrl}
              alt="Preview"
              sx={{ width: "100%", maxWidth: 420, borderRadius: 2 }}
            />
          )}

          <Button
            variant="contained"
            onClick={listNFTForSale}
            disabled={loadingState === "loading"}
          >
            {loadingState === "loading" ? <CircularProgress size={22} /> : "Create NFT"}
          </Button>
        </CardContent>
      </Card>

      <Snackbar open={toast.open} autoHideDuration={2400} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


export interface NFT {
  price: string;
  tokenId: number;
  seller: string;
  owner: string;
  image: string;
  name: string;
  description: string;
  tokenURI?: string;
}

export interface MarketItem {
  price: { toString(): string };
  tokenId: { toString(): string };
  sender: string;
  owner: string;
}

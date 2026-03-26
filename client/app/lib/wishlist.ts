"use client";

const STORAGE_KEY = "nft-wishlist";

export function getWishlist(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isWishlisted(tokenId: number) {
  return getWishlist().includes(tokenId);
}

export function toggleWishlist(tokenId: number) {
  if (typeof window === "undefined") return [];
  const list = getWishlist();
  const next = list.includes(tokenId)
    ? list.filter((id) => id !== tokenId)
    : [...list, tokenId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

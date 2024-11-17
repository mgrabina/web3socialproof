import { isAddress } from "viem";

// Format text to have first letter uppercase and rest lowercase
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function shortenAddress(address: string): string {
  if (!address) return "";

  if (!isAddress(address)) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

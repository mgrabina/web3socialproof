export function shortenAddress(address: string): string {
  if (!address) return "";

  const evmAddressRegex = "^(0x)?[0-9a-fA-F]{40}$";
  const isAddress = new RegExp(evmAddressRegex).test(address);

  if (!isAddress) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

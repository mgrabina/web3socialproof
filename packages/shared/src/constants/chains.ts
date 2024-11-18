export const SupportedChainIds = [
  1, 56, 137, 42161, 8453, 10, 11155111, 97, 80002, 421614, 84532, 11155420,
] as const;
export type SupportedChainId = (typeof SupportedChainIds)[number];
export const isChainIdSupported = (
  chainId: number
): chainId is SupportedChainId => {
  return SupportedChainIds.includes(chainId as SupportedChainId);
};

export type Chain = {
  chainId: SupportedChainId;
  name: string;
  scannerUrl: string;
};

export const chains: Record<SupportedChainId, Chain> = {
  1: {
    chainId: 1,
    name: "Ethereum",
    scannerUrl: "https://etherscan.io",
  },
  56: {
    chainId: 56,
    name: "Binance Smart Chain",
    scannerUrl: "https://bscscan.com",
  },
  137: {
    chainId: 137,
    name: "Polygon",
    scannerUrl: "https://polygonscan.com",
  },
  42161: {
    chainId: 42161,
    name: "Arbitrum",
    scannerUrl: "https://arbiscan.io",
  },
  8453: {
    chainId: 8453,
    name: "Base",
    scannerUrl: "https://basescan.org",
  },
  10: {
    chainId: 10,
    name: "Optimism",
    scannerUrl: "https://optimistic.etherscan.io",
  },

  // Testnets
  11155111: {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    scannerUrl: "https://sepolia.etherscan.com",
  },
  97: {
    chainId: 97,
    name: "Binance Smart Chain Testnet",
    scannerUrl: "https://testnet.bscscan.com",
  },
  80002: {
    chainId: 80002,
    name: "Polygon Amoy",
    scannerUrl: "https://amoy.polygonscan.com",
  },
  421614: {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    scannerUrl: "https://sepolia.arbiscan.io",
  },
  84532: {
    chainId: 84532,
    name: "Base Sepolia",
    scannerUrl: "https://sepolia.basescan.org",
  },
  11155420: {
    chainId: 11155420,
    name: "Optimism Sepolia",
    scannerUrl: "https://sepolia-optimism.etherscan.io",
  },
};

export const SupportedChainNames = Object.values(chains).map(
  (chain) => chain.name
);

export const chainIdToName = (chainId: SupportedChainId) => {
  return chains[chainId].name;
}

export const addressToExplorerUrl = (
  chainId: SupportedChainId,
  address: string
) => {
  return `${chains[chainId].scannerUrl}/address/${address}`;
}

export const txHashToExplorerUrl = (
  chainId: SupportedChainId,
  txHash: string
) => {
  return `${chains[chainId].scannerUrl}/tx/${txHash}`;
}
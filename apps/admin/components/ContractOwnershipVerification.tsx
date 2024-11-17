"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  createConfig,
  custom,
  useAccount,
  useConnect,
  useSignMessage,
  WagmiProvider,
} from "wagmi";
import { mainnet } from "wagmi/chains";
import {
  ConnectButton,
  RainbowKitProvider,
  useAccountModal,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { getTrpcClientForClient } from "@/utils/trpc/client";
import { env } from "@/lib/constants";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Check, Copy } from "lucide-react";
import { shortenAddress } from "@/utils/strings/string.utils";

export default function ContractVerification({
  chainId,
  contractAddress,
  onVerify,
  allowCustomSignature = false,
}: {
  chainId: number;
  contractAddress: string;
  onVerify?: () => void;
  allowCustomSignature?: boolean;
}) {
  const config = getDefaultConfig({
    appName: "My RainbowKit App",
    projectId: "YOUR_PROJECT_ID",
    chains: [mainnet],
    ssr: true,
  });
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ContractOwnershipVerificationContainer
            chainId={chainId}
            contractAddress={contractAddress}
            onVerify={onVerify}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function ContractOwnershipVerificationContainer({
  chainId,
  contractAddress,
  onVerify,
}: {
  chainId: number;
  contractAddress: string;
  onVerify?: () => void;
}) {
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [customSignature, setCustomSignature] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { openAccountModal } = useAccountModal();

  useEffect(() => {
    const fetchVerificationCode = async () => {
      try {
        const trpc = await getTrpcClientForClient(env);
        const code = await trpc.contracts.getContractVerificationCode.query({
          chainId,
          contractAddress,
        });
        setVerificationCode(code);
      } catch (error) {
        console.error("Error fetching verification code:", error);
        toast({
          title: "Error",
          description: "Failed to fetch verification code.",
        });
      }
    };

    fetchVerificationCode();
  }, [chainId, contractAddress]);

  const handleVerify = async () => {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Verification code not found.",
      });
      return;
    }

    const signature =
      customSignature ||
      (await signMessageAsync({ message: verificationCode }));

    if (!signature) {
      toast({
        title: "Error",
        description: "Signature not provided.",
      });
      return;
    }

    try {
      setIsLoading(true);

      const trpc = await getTrpcClientForClient(env);
      try {
        await trpc.contracts.verifyContract.mutate({
          chainId,
          contractAddress,
          signature,
        });

        toast({
          title: "Success",
          description: "Contract ownership verified!",
        });
      } catch (error) {
        console.error("Error verifying contract:", error);
        toast({
          title: "Error",
          description: "Verification failed. Are you the contract owner?",
        });
      }
      if (onVerify) onVerify();
    } catch (error) {
      console.error("Error verifying contract:", error);
      toast({ title: "Error", description: "Verification failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/verify?chainId=${chainId}&contractAddress=${contractAddress}&code=${verificationCode}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000); // Reset the icon after 2 seconds
    });
  };

  return (
    <div className="space-y-4">
      <label className="block">
        Please sign the verification code with the wallet used to deploy the
        contract to verify your ownership.
      </label>
      <div className="space-y-2 text-gray-500">
        <p>Chain ID: {chainId}</p>
        <p>Contract Address: {contractAddress}</p>
        {verificationCode && (
          <p className="text-sm mt-2">Verification Code: {verificationCode}</p>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Signature
          </label>
          <input
            type="text"
            value={customSignature}
            onChange={(e) => setCustomSignature(e.target.value)}
            placeholder="Enter custom signature"
            className="block w-full px-4 py-2 border rounded-md"
          />
        </div>
        <div>
          <Button
            onClick={handleVerify}
            disabled={!verificationCode || !customSignature || isLoading}
            variant="default"
            className="mt-6"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </div>

      <label>or </label>
      {!isConnected ? (
        <Button className="bg-transparent hover:bg-transparent">
          <ConnectButton label="Connect Wallet & Sign"></ConnectButton>
        </Button>
      ) : (
        <>
          <Button
            onClick={handleVerify}
            disabled={!verificationCode || isLoading}
            variant="default"
          >
            {isLoading
              ? "Verifying..."
              : `Sign with ${shortenAddress(address ?? "")}`}
          </Button>
          <label
            className="ml-2 text-sm text-gray-500 cursor-pointer"
            onClick={() => openAccountModal && openAccountModal()}
          >
            Change Wallet
          </label>
        </>
      )}

      <div className="flex items-center space-x-2 mt-4">
        <label className="block text-sm text-gray-500">
          Get a shareable link for a teammate:
        </label>
        <Button
          variant="outline"
          className="flex items-center space-x-2"
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

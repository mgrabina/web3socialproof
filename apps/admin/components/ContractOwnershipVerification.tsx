"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { env } from "@/lib/constants";
import { getTrpcClientForClient } from "@/utils/trpc/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import {
  ConnectButton,
  getDefaultConfig,
  RainbowKitProvider,
  useAccountModal,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { shortenAddress } from "@web3socialproof/shared/utils/evm";
import { Check, Copy, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useSignMessage, WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { Skeleton } from "./ui/skeleton";

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

    if (chainId && contractAddress) {
      fetchVerificationCode();
    }
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
    const shareableLink = `${window.location.origin}/verify?chainId=${chainId}&contractAddress=${contractAddress}&code=${verificationCode}`; //todo double check window.location.origin
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
        To verify the ownership of this contract, we need to signed a code
        generated for you, using the contract deployer wallet.
      </label>
      <div className="space-y-2 text-sm">
        <p className="text-gray-500">Chain ID: {chainId}</p>
        <p className="text-gray-500">Contract Address: {contractAddress}</p>
        <p className="mt-2 text-black">
          Verification Code:
          {verificationCode ? (
            " " + verificationCode
          ) : (
            <Skeleton className="h-4 w-10" />
          )}
        </p>
      </div>
      <br />

      <Separator></Separator>

      <Accordion className="w-full" type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger
            className="
            hover:text-gray-800
          hover:bg-gray-200
          transition-all
          text-sm
          hover:cursor-pointer
          bg-gray-100
          rounded-sm
          w-full
          text-left
          p-2
          text-gray-500
          "
          >
            I have access to the deployer
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-2">
              <div className="flex items-center space-x-4 mt-2 mb-2">
                {!isConnected ? (
                  <ConnectButton label="Connect Wallet & Sign"></ConnectButton>
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
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or insert a custom signature
                  </label>
                  <input
                    type="text"
                    value={customSignature}
                    onChange={(e) => setCustomSignature(e.target.value)}
                    placeholder="Enter custom signature"
                    className="block w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <br />
                <div>
                  <Button
                    onClick={handleVerify}
                    disabled={
                      !verificationCode || !customSignature || isLoading
                    }
                    variant="default"
                    className="mt-6"
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>

              {/* Info badge */}
              <div className="bg-blue-200 rounded-sm p-2 mt-2 flex items-center space-x-2">
                <Info className="w-10 h-10 text-blue-600" />
                <label className="block text-sm text-gray-500">
                  No transactions involved. You are only signing an off-chain
                  message, so this is safe and no gas fees are involved.
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem className="mt-2" value="item-2">
          <AccordionTrigger
            className="
          hover:text-gray-800
          hover:bg-gray-200
          transition-all
          text-sm
          hover:cursor-pointer
          bg-gray-100
          rounded-sm
          w-full
          text-left
          p-2
          text-gray-500
        "
          >
            I do not have access to the deployer
          </AccordionTrigger>
          <AccordionContent className="w-full">
            <div className="flex justify-between items-center space-x-2 p-2 w-full">
              <label className="block text-sm text-gray-500">
                No problem, share this link to a teammate:
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ContractOwnershipVerificationContainer from "@/components/ContractOwnershipVerification";
import { Card, CardContent, CardHeader } from "./ui/card";

export default function ShareableContractVerificationPage() {
  const searchParams = useSearchParams();
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [contractAddress, setContractAddress] = useState<string>("");
  const [allowCustomSignature, setAllowCustomSignature] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Fetch query parameters from the URL
  useEffect(() => {
    const queryChainId = searchParams.get("chainId");
    const queryContractAddress = searchParams.get("contractAddress");
    const queryAllowCustomSignature = searchParams.get("allowCustomSignature");

    if (queryChainId) setChainId(Number(queryChainId));
    if (queryContractAddress) setContractAddress(queryContractAddress);
    if (queryAllowCustomSignature)
      setAllowCustomSignature(queryAllowCustomSignature === "true");
  }, [searchParams]);

  const handleVerify = () => {
    alert("Contract ownership verified!");
  };

  return (
    <Card className="container mx-auto p-6 max-w-4xl">
      <CardHeader className="text-2xl font-bold mb-6">
        Contract Ownership Verification
      </CardHeader>
      <CardContent>
        {chainId && contractAddress && (
          <div>
            <ContractOwnershipVerificationContainer
              chainId={chainId}
              contractAddress={contractAddress}
              allowCustomSignature={allowCustomSignature}
              onVerify={handleVerify}
            />
          </div>
        )}
        {/* Invalid Params */}
        {!chainId && !contractAddress && (
          <div className="text-center text-gray-500 mt-8">
            Invalid URL parameters. Please check the URL and try again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

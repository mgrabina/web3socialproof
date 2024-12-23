"use client";

import ContractVerificationDialog from "@/components/ContractOwnershipVerificationDialog";
import { LoadingTable } from "@/components/LoadingTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { SelectContract } from "@web3socialproof/db";
import {
  addressToExplorerUrl,
  chainIdToName,
  isChainIdSupported,
} from "@web3socialproof/shared/constants/chains";
import { shortenAddress } from "@web3socialproof/shared/utils/evm";
import { AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ContractsVerificationManager() {
  const [contracts, setContracts] = useState<SelectContract[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<
    SelectContract | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch contracts from the backend
  useEffect(() => {
    async function fetchContracts() {
      setIsLoading(true);
      try {
        const response = await fetch("/contracts/api");
        const data = await response.json();
        setContracts(data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        toast({
          title: "Error",
          description: "Failed to load contracts.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchContracts();
  }, []);

  const handleVerify = (contract: SelectContract) => {
    setSelectedContract(contract);
    setIsDialogOpen(true);
  };

  const handleVerificationSuccess = () => {
    toast({
      title: "Success",
      description: "Contract ownership verified.",
    });
    setIsDialogOpen(false);
    // Optionally reload contracts
    setContracts((prev) =>
      prev.map((c) =>
        c.contract_address === selectedContract?.contract_address
          ? { ...c, ownership_verified: true }
          : c
      )
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        {/* <h1 className="text-3xl font-bold">Contracts Verification</h1> */}
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <label className="text-sm text-gray-600">
            We ask everyone to verify the ownership of each contract used in
            metrics, to ensure nobody can impersonate others.
          </label>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingTable></LoadingTable>
          ) : contracts.length === 0 ? (
            <p>No contracts used in metrics yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead>Contract Name</TableHead> */}
                  <TableHead>Chain ID</TableHead>
                  <TableHead>Contract Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.contract_address}>
                    {/* <TableCell>{contract.contract_name || "Unknown"}</TableCell> */}
                    <TableCell>
                      {contract.chain_id}
                      {isChainIdSupported(contract.chain_id)
                        ? " (" + chainIdToName(contract.chain_id) + ") "
                        : ""}
                    </TableCell>
                    <TableCell>
                      {isChainIdSupported(contract.chain_id) ? (
                        <Link
                          className="text-blue-500 hover:text-blue-800 hover:underline transition-all cursor-pointer"
                          href={addressToExplorerUrl(
                            contract.chain_id,
                            contract.contract_address
                          )}
                          target="_blank"
                        >
                          {shortenAddress(contract.contract_address)}
                        </Link>
                      ) : (
                        shortenAddress(contract.contract_address)
                      )}
                    </TableCell>
                    <TableCell>
                      {contract.ownership_verified ? (
                        <span className="flex items-center text-blue-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Not Verified
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!contract.ownership_verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerify(contract)}
                        >
                          Verify
                        </Button>
                      )}
                      {/* View on scanner
                      {isChainIdSupported(contract.chain_id) && (
                        <Link
                          href={addressToExplorerUrl(
                            contract.chain_id,
                            contract.contract_address
                          )}
                          target="_blank"
                        >
                          <Button variant="outline" size="sm" className="ml-2">
                            View on Scanner
                          </Button>
                        </Link>
                      )} */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {/* <CardFooter>
          <p className="text-sm text-gray-600">
            Manage your contracts and ensure their ownership is verified for
            secure operations.
          </p>
        </CardFooter> */}
      </Card>

      {/* Contract Verification Dialog */}
      {selectedContract && (
        <ContractVerificationDialog
          chainId={selectedContract.chain_id}
          contractAddress={selectedContract.contract_address}
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          onVerify={handleVerificationSuccess}
        />
      )}
    </div>
  );
}

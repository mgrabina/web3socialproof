"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ContractOwnershipVerificationContainer from "@/components/ContractOwnershipVerification";

export default function ContractVerificationDialog({
  chainId,
  contractAddress,
  onVerify,
  open,
  setOpen,
  allowCustomSignature = true,
}: {
  chainId: number;
  contractAddress: string;
  onVerify?: () => void;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  allowCustomSignature?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-opacity-90 transition-opacity duration-300 ease-in-out">
        <DialogHeader>
          <DialogTitle>Verify Contract Ownership</DialogTitle>
          <DialogClose asChild>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </DialogClose>
        </DialogHeader>
        <ContractOwnershipVerificationContainer
          chainId={chainId}
          contractAddress={contractAddress}
          onVerify={onVerify}
          allowCustomSignature={allowCustomSignature}
        />
      </DialogContent>
    </Dialog>
  );
}

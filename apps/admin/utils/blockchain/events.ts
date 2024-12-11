// import { keccak256 } from "ethers/lib/utils";

/**
 * Expands a single ABI input type, including tuples, arrays, and nested tuples.
 * @param input The ABI input object to expand.
 * @returns The canonical Solidity type string.
 */
const expandAbiType = (input: any): string => {
  if (input.type === "tuple") {
    // If it's a tuple, recursively expand its components
    const componentTypes = input.components.map(expandAbiType).join(",");
    return `(${componentTypes})`;
  }
  if (input.type.endsWith("[]")) {
    // If it's an array, process the base type
    const baseType = input.type.slice(0, -2);
    if (baseType === "tuple") {
      const componentTypes = input.components.map(expandAbiType).join(",");
      return `(${componentTypes})[]`;
    }
  }
  return input.type; // Return the type for non-tuple, non-array inputs
};

/**
 * Extracts the canonical event signature from the ABI.
 * @param abi The parsed ABI array.
 * @returns An array of event signatures.
 */
export const getEventSignatures = (abi: any[]): string[] => {
  return abi
    .filter((item: any) => item.type === "event") // Filter for events
    .map((item: any) => {
      const inputs = item.inputs.map(expandAbiType).join(","); // Expand and join input types
      return `${item.name}(${inputs})`; // Construct the canonical event signature
    });
};

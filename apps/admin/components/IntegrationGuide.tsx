import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Button } from "./ui/button";

import { toast } from "@/hooks/use-toast";
import { SelectApiKey } from "@web3socialproof/db";
import { useEffect, useState } from "react";

export default function IntegrationGuide() {
  const [apiKeys, setApiKeys] = useState<SelectApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for table

  const [copied, setCopied] = useState(false);

  // Fetch API keys from the server
  useEffect(() => {
    async function fetchApiKeys() {
      setIsLoading(true); // Start loading
      const response = await fetch("/api-keys/api");
      const keys = await response.json();
      setApiKeys(keys);
      setIsLoading(false); // End loading
    }
    fetchApiKeys();
  }, []);

  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "The content has been copied to your clipboard.",
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset the icon after 2 seconds
  };

  const getIntegrationCode = (apiKey: string) =>
    `<script\n  src="https://pixel.gobyherd.com?apiKey=${apiKey}"\n  async\n></script>`;

  const integrationSnippet = isLoading
    ? "Loading..."
    : apiKeys.length
    ? getIntegrationCode(apiKeys[0].api_key)
    : "<script src='https://pixel.gobyherd.com?apiKey=YOUR_API_KEY' async></script>";

  return (
    <Card className="w-full mx-auto border border-gray-200 shadow-md" id="integration-guide">
      <CardHeader className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Integration Guide
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => handleCopyKey(integrationSnippet)}
            className="hover:bg-gray-100"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                <span> Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4  mr-2" />
                <span> Copy Code</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-sm text-gray-600 mb-4">
          To integrate your API key, add the following snippet to the{" "}
          <code className="font-mono text-blue-600">&lt;head&gt;</code> of your
          HTML file.
          <br /> Replace{" "}
          <code className="font-mono text-blue-600">YOUR_API_KEY</code> with any
          of your{" "}
          <a className="text-blue-600 hover:text-blue-900" href="/api-keys">
            API keys
          </a>
          .
        </p>
        <div className="rounded-md overflow-hidden shadow-inner">
          <SyntaxHighlighter
            language="html"
            style={docco}
            showLineNumbers
            lineNumberStyle={{ color: "#999" }}
            className="text-sm"
          >
            {integrationSnippet}
          </SyntaxHighlighter>
        </div>
      </CardContent>
    </Card>
  );
}

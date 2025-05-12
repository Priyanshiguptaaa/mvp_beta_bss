"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (!storedApiKey) {
      router.replace("/");
      return;
    }
    setApiKey(storedApiKey);
  }, [router]);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("apiKey");
    router.replace("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6a8dff] via-[#a084ee] to-[#e0c3fc] p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 bg-white/90 shadow-lg">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">API Key</h2>
              <div className="flex items-center gap-4">
                <code className="bg-gray-100 p-3 rounded flex-1 font-mono">
                  {apiKey}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyApiKey}
                  title="Copy API Key"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Use this API key to authenticate your requests to the Echosys API.
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
} 
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

            {/* Quick Start & Usage Section */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
              <pre className="bg-gray-100 rounded p-4 overflow-x-auto text-sm mb-6">
                <code>{`from echosysai import EchoSysAI

# Initialize with your API key
echosys = EchoSysAI(api_key="your-api-key", auto_wrap=True)

# Your LLM functions will be automatically monitored
def generate_completion(prompt: str) -> str:
    return "Generated response"

# Or use the decorator for explicit monitoring
@echosys.monitor_llm
def chat_with_llm(messages: list) -> str:
    return "Chat response"`}
                </code>
              </pre>

              <h2 className="text-xl font-semibold mb-2">Usage</h2>
              <h3 className="font-semibold mt-4 mb-1">1. Auto-monitoring</h3>
              <pre className="bg-gray-100 rounded p-4 overflow-x-auto text-sm mb-4">
                <code>{`echosys = EchoSysAI(api_key="your-api-key", auto_wrap=True)

def generate_text(prompt: str) -> str:
    return "Generated text"

def chat_completion(messages: list) -> str:
    return "Chat response"`}
                </code>
              </pre>
              <h3 className="font-semibold mt-4 mb-1">2. Manual Monitoring</h3>
              <pre className="bg-gray-100 rounded p-4 overflow-x-auto text-sm mb-4">
                <code>{`@echosys.monitor_llm
class LLMAgent:
    def generate(self, prompt: str) -> str:
        return "Generated response"
    
    def chat(self, messages: list) -> str:
        return "Chat response"`}
                </code>
              </pre>
              <h3 className="font-semibold mt-4 mb-1">3. Send Data to EchoSys</h3>
              <pre className="bg-gray-100 rounded p-4 overflow-x-auto text-sm">
                <code>{`# Send all interactions
echosys.send_interactions()

# Send metrics
echosys.send_metrics()

# Send traces
echosys.send_traces()

# Send logs
echosys.send_logs()`}
                </code>
              </pre>
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
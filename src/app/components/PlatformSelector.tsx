"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { simulateApiCall } from "../utils/apiSimulator";
import { Eye, EyeOff, Play } from "lucide-react";
import PlatformResultsTable from "./PlatformResultsTable";

const platforms = [
  { name: "CTxbt", image: "/assets/ctxbt.svg" },
  { name: "Kaito", image: "/assets/kaito.svg" },
  { name: "Dune", image: "/assets/dune.svg" },
  { name: "Chainlink", image: "/assets/chainlink.svg" },
  { name: "1Inch", image: "/assets/1inch.svg" },
  { name: "dYdX", image: "/assets/dydx.svg" },
  { name: "Moralis", image: "/assets/moralis.svg" },
];

interface PlatformSelectorProps {
  onSimulateSuccess: (data: any) => void;
}

const PlatformSelector = ({ onSimulateSuccess }: PlatformSelectorProps) => {
  const [apiKey, setApiKey] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handlePlatformChange = (platformName: string) => {
    if (platformName === "CTxbt") {
      setSelectedPlatform(platformName);
    } else {
      toast.info(`${platformName} - Coming Soon!`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  const handleApiSimulate = async () => {
    if (!apiKey || !selectedPlatform) return;

    const result = await simulateApiCall(apiKey, selectedPlatform);
    if (result.success && result.data) {
      setResults(result.data);
      setShowResults(true);
      onSimulateSuccess?.(result.data);
      toast.success("Simulation data fetched successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type={showApiKey ? "text" : "password"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API Key"
          className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => setShowApiKey(!showApiKey)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
        >
          {showApiKey ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="relative">
        <select
          value={selectedPlatform}
          onChange={(e) => handlePlatformChange(e.target.value)}
          className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="">Select Platform</option>
          {platforms.map((platform) => (
            <option key={platform.name} value={platform.name}>
              {platform.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <button
        onClick={handleApiSimulate}
        disabled={!apiKey || !selectedPlatform}
        className={`flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-lg transition-colors ${
          apiKey && selectedPlatform
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-800 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Play className="w-4 h-4" />
        <span>Simulate</span>
      </button>

      {showResults && <PlatformResultsTable data={results} />}
    </div>
  );
};

export default PlatformSelector;

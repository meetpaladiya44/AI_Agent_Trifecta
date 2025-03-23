"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { simulateApiCall } from "../utils/apiSimulator";
import { Eye, EyeOff, Play } from "lucide-react";
import PlatformResultsTable from "./PlatformResultsTable";

const generateCSV = (data: any[]): any => {
  const headers = [
    "Signal Generation Date",
    "Signal Message",
    "Token Mentioned",
    "Token ID",
    "Current Price",
    "TP1",
    "TP2",
    "SL",
    "Exit Price",
    "P&L",
  ];

  const rows = data.map((item) => {
    const signalData = item.signal_data;
    return [
      signalData.tweet_timestamp,
      signalData.signal,
      signalData.tokenMentioned,
      signalData.tokenId,
      signalData.currentPrice,
      signalData.targets[0],
      signalData.targets[1],
      signalData.stopLoss,
      item.exit_price || "",
      item.p_and_l || "",
    ]
      .map((field) => `"${field || ""}"`)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
};

const downloadCSV = (csvContent: string, fileName: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const platforms = [
  { name: "CTxbt", image: "/assets/ctxbt.svg" },
  { name: "Kaito", image: "/assets/kaito.svg" },
  { name: "Dune", image: "/assets/dune.png" },
  { name: "Chainlink", image: "/assets/chainlink.png" },
  { name: "1Inch", image: "/assets/1inch.png" },
  { name: "dYdX", image: "/assets/dydx.svg" },
  { name: "Moralis", image: "/assets/moralis.png" },
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef(null);

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
        <div
          ref={triggerRef}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg cursor-pointer flex items-center justify-between"
        >
          {selectedPlatform ? (
            <div className="flex items-center">
              <img
                src={platforms.find((p) => p.name === selectedPlatform)?.image}
                alt={selectedPlatform}
                className="w-5 h-5 mr-2"
              />
              <span>{selectedPlatform}</span>
            </div>
          ) : (
            <span>Select Platform</span>
          )}
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
        {dropdownOpen && triggerRef.current && (
          <div
            style={{
              position: "absolute",
              top: triggerRef.current.getBoundingClientRect().height,
              left: 0, // Align with the left edge of the trigger
              width: triggerRef.current.getBoundingClientRect().width, // Match trigger width
              maxHeight: "200px",
              overflowY: "scroll",
              zIndex: 1000,
            }}
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          >
            {platforms.map((platform) => (
              <div
                key={platform.name}
                onClick={() => {
                  if (platform.name === "CTxbt") {
                    setSelectedPlatform(platform.name);
                    setDropdownOpen(false);
                  }
                }}
                className={`flex items-center p-3 ${
                  platform.name === "CTxbt"
                    ? "cursor-pointer hover:bg-gray-700"
                    : "cursor-not-allowed opacity-70"
                }`}
              >
                <img
                  src={platform.image}
                  alt={platform.name}
                  className="w-7 h-7 mr-2 bg-transparent"
                  style={{ background: "none" }}
                />
                <span>{platform.name}</span>
                {platform.name !== "CTxbt" && (
                  <span className="ml-2 text-gray-400">(Coming Soon ✨)</span>
                )}
              </div>
            ))}
          </div>
        )}
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

      {showResults && (
        <div>
          <PlatformResultsTable data={results} />{" "}
          <button
            onClick={() => {
              const csvContent = generateCSV(results);
              downloadCSV(csvContent, "backtesting.csv");
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;

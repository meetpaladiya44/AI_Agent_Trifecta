// apiSimulator.ts
import { toast } from "react-toastify";

interface SimulationResponse {
  success: boolean;
  data?: any[];
  error?: string;
  status?: number;
}

function generateCSV(data: any[]): string {
  const headers = [
    "Twitter Account",
    "Tweet",
    "Tweet Date",
    "Signal Generation Date",
    "Signal Message",
    "Token Mentioned",
    "Token ID",
    "Price at Tweet",
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
      signalData.twitterHandle,
      signalData.tweet_link,
      signalData.tweet_timestamp,
      signalData.tweet_timestamp,
      signalData.signal,
      signalData.tokenMentioned,
      signalData.tokenId,
      signalData.priceAtTweet,
      signalData.currentPrice,
      signalData.targets[0],
      signalData.targets[1],
      signalData.stopLoss,
      "", // Exit Price (null)
      "", // P&L (null)
    ]
      .map((field) => `"${field || ""}"`)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const simulateApiCall = async (apiKey: string, platform: string) => {
  try {
    // First fetch from CTxbt API
    const ctxbtResponse = await fetch("/api/ctxbt-api-call", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!ctxbtResponse.ok) {
      throw new Error(`CTxbt API error: ${ctxbtResponse.status}`);
    }

    const ctxbtData = await ctxbtResponse.json();

    // Then process signals
    const processResponse = await fetch("/api/process-signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: ctxbtData.data }),
    });

    if (!processResponse.ok) {
      throw new Error("Signal processing failed");
    }

    const processedData = await processResponse.json();

    return {
      success: true,
      data: processedData.data,
    };
  } catch (error) {
    console.error("API Simulation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// export const simulateApiCall = async (
//   apiKey: string,
//   platform: string
//   //   setShowTable: (show: boolean) => void
// ): Promise<SimulationResponse> => {
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 10000);

//   try {
//     console.log("Making API call with:", { apiKey, platform });

//     const response = await fetch("/api/ctxbt-api-call", {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//       },
//       signal: controller.signal,
//     });

//     clearTimeout(timeoutId);
//     console.log("Response status:", response.status);

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(
//         `HTTP error! status: ${response.status}, message: ${errorText}`
//       );
//     }

//     const data = await response.json();
//     console.log("Received data:", data);

//     // Generate and download CSV on client-side
//     if (data.success && data.data && data.data.length > 0) {
//       const csvContent = generateCSV(data.data);
//       //   downloadCSV(csvContent, "backtesting.csv");
//     }

//     // setShowTable(true);

//     return {
//       success: true,
//       data: data.data,
//     };
//   } catch (error) {
//     clearTimeout(timeoutId);
//     console.error("API Simulation Error Details:", {
//       error,
//       message: error instanceof Error ? error.message : "Unknown error",
//       stack: error instanceof Error ? error.stack : undefined,
//     });

//     let errorMessage = "Failed to fetch simulation data.";
//     let statusCode: number | undefined;

//     if (error instanceof TypeError) {
//       errorMessage += " Network error occurred.";
//     } else if (error instanceof Error) {
//       errorMessage += ` ${error.message}`;
//       const statusMatch = error.message.match(/status: (\d+)/);
//       statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined;
//     }

//     toast.error(errorMessage, {
//       position: "top-center",
//       autoClose: 5000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       theme: "light",
//     });

//     return {
//       success: false,
//       error: errorMessage,
//       status: statusCode,
//     };
//   }
// };

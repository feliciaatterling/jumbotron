export default async function handler(req, res) {
  // --- CORS ---
  // Allows your frontend (same domain or other) to call this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Forward the request body directly to Clubmate
    const upstreamResponse = await fetch(
      "https://api.clubmate.co/fetchprizes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.CLUBMATE_API_KEY, // 🔒 secret
        },
        body: JSON.stringify(req.body),
      }
    );

    // Parse response
    const data = await upstreamResponse.json();
    if (!data.data?.totalPrizeMoney) {
      return res.status(400).json({ error: "Invalid response format" });
    }

    // Return response as-is to frontend
    return res.status(upstreamResponse.status).json(data);
  } catch (error) {
    console.error("Clubmate proxy error:", error);
    return res.status(500).json({ error: "Internal proxy error" });
  }
}

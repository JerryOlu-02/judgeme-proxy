export default async function handler(req, res) {
  // 1. Attach the CORS headers so Shopify browsers don't panic
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle browser Preflight checks instantly
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 2. Grab your Private Token from Vercel's secure environment variables
  const privateToken = process.env.JUDGEME_PRIVATE_TOKEN;

  // 3. Extract the route (e.g., '/reviews' or '/products/-1') and other params sent from Shopify
  const { route, ...otherParams } = req.query;

  if (!route) {
    return res.status(400).json({ error: "Missing route parameter" });
  }

  // 4. Build the actual Judge.me API URL
  const url = new URL(`https://judge.me/api/v1${route}`);

  for (const [key, value] of Object.entries(otherParams)) {
    url.searchParams.append(key, value);
  }

  try {
    // 5. Fetch from Judge.me securely using the Private token as a Header
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "api-token": privateToken,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // 6. Send the data back to Shopify
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch data from Judge.me" });
  }
}

import chromium from "@sparticuz/chromium-min";
import Vibrant from "node-vibrant";
import OpenAI from "openai";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

export const maxDuration = 60; // Or whatever timeout you want

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set your OpenAI API key in .env.local
});

function getColorPalette(imageBuffer: any) {
  return new Promise((resolve, reject) => {
    Vibrant.from(imageBuffer).getPalette((err, palette) => {
      if (err || !palette) {
        reject(err); // Reject the promise in case of error
        return;
      }

      try {
        const colors = {
          background: palette.LightMuted?.hex,
          primary: palette.Vibrant?.hex,
          secondary: palette.DarkVibrant?.hex,
          tertiary: palette.LightVibrant?.hex,
          accent: palette.DarkMuted?.hex,
        };

        resolve(colors); // Resolve the promise with the color palette
      } catch (error) {
        reject(error); // Handle any errors during color extraction
      }
    });
  });
}

export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const width = parseInt(searchParams.get("width") ?? "1280", 10) || 1280; // Default width
  const height = parseInt(searchParams.get("height") ?? "720", 10) || 720; // Default height

  if (!url) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!url) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let cuttedFirstSection,
    fullPageScreenshot,
    colorPalette,
    pageTitle,
    headerTexts,
    openAIResponse;

  try {
    const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;
    const tarFile =
      "https://usiih8uwuwoozjy2.public.blob.vercel-storage.com/Chromium%20v126.0.0%20pack-hQUHmxFfkH5w8gVBeap0ykn9K2nZmv.tar";

    const browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        (await chromium.executablePath(tarFile)),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Set the viewport to the provided dimensions
    await page.setViewport({ width, height });

    const withSchema = url.startsWith("http://") || url.startsWith("https://");

    const urlWithSchema = withSchema ? url : `https://${url}`;

    // Check if url is valid
    try {
      Boolean(new URL(urlWithSchema));
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Navigate to the URL
    await page.goto(urlWithSchema, { waitUntil: "networkidle2" });

    // Take a screenshot
    fullPageScreenshot = await page.screenshot({
      type: "png", // PNG does not support 'quality'
      fullPage: true,
    });

    cuttedFirstSection = await sharp(fullPageScreenshot)
      .extract({
        left: 0, // Start at the left of the image
        top: 0, // Start from the top of the image
        width, // Set maximum width for readability
        height: height, // Crop the first 4 sections based on height
      })
      .toBuffer();

    colorPalette = await getColorPalette(cuttedFirstSection); // Wait for the pixel extraction

    // Extract key headers (h1, h2, h3, etc.) from the page
    headerTexts = await page.evaluate(() => {
      const headers: any[] = [];
      const headerElements = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6"
      );
      headerElements.forEach((el) => headers.push(el.textContent));
      return headers.slice(0, 25); // Extract the first 5 headers (adjust as needed)
    });

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error("Error generating screenshot:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate screenshot and extract content",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Build a dynamic prompt based on extracted information
    const prompt = `
      I am attaching a URL (${url}) that provides the following information:
      - Website Title: "${pageTitle}"
      - Color Palette: ${JSON.stringify(colorPalette)}
      - Key content from the headers: "${headerTexts.join(", ")}"

      Please generate a JSON configuration for a social-proof notification that reflects the website's topic, branding, and tone. Ensure that the notification's colors and styles match the extracted color palette and the core message of the website.

      The title should highlight impactful user actions, e.g. "3.5k artists enrolled today!" but you have to adapt it to the website topic/use-case (use big numbers and short like 3k for 3000). The subtitle should encourage high-impact actions e.g. "Join now and get started today!" but adapted to the website's core topic as well.
      Do not use my examples directly, generate unique content based on the website's context.

      Response JSON format:
      {
        "fontFamily": "string",
        "titleColor": "string",
        "subtitleColor": "string",
        "backgroundColor": "string",
        "iconBackgroundColor": "string",
        "iconBorderRadius": "string",
        "iconColor": "string",
        "borderRadius": "string",
        "border": "string",
        "boxShadow": "string",
        "title": "string",
        "subtitle": "string"
      }

      Return ONLY the JSON response that reflects the website’s context and visual style.
    `;

    // Send to OpenAI for configuration
    openAIResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
  } catch (error) {
    console.error("Error generating configuration:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate configuration" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Return the configuration and color information
  return new Response(
    JSON.stringify({
      config: openAIResponse.choices[0].message.content,
      screenshot: cuttedFirstSection.toString("base64"),
      colorPalette,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }, // Correct Content-Type for JSON
    }
  );
}

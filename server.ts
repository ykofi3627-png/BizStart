import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client so the server doesn't crash on startup if API key is missing.
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. API calls will fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST Endpoint to fetch business plan & equipment pricing details
app.post("/api/generate-plan", async (req, res) => {
  const { businessType } = req.body;

  if (!businessType || typeof businessType !== "string" || businessType.trim().length === 0) {
    return res.status(400).json({ error: "Please enter a valid business type." });
  }

  const query = businessType.trim();

  try {
    const api = getAiClient();
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing. Please set this secret in the AI Studio Settings menu to connect with Gemini.");
    }

    const response = await api.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Provide a structured set of equipment, tools, and pricing details needed to start a business of type: "${query}".
Suggest exact brands and items, with custom prices mapped to Amazon, Jiji, Jumia, and Temu to let standard versus discount bulk and economy prices shine. Ensure Jiji corresponds to secondhand or direct dealer budget deals, Jumia to official retail in Africa, Temu to ultra-low-cost direct imports, and Amazon to global retail.
Provide estimations for the three tiers: Lower Grade (Budget / DIY / Used), Middle Grade (Standard / Recommended), and Professional (Top-tier / Corporate / High-speed).`,
      config: {
        systemInstruction: `You are an expert entrepreneurial startup coach and commercial procurement officer.
Your task is to analyze the requested business or career, outline the essential workspace tools, hardware, software, and physical equipment needed to launch, and generate realistic price ranges.
For each tool, provide details for three price sections/grades:
1. "lowerGrade": Economy option. Best sourced from Jiji (African secondhand/used peer-to-peer classifieds model, cheap but functional) or Temu (ultra-low-cost bulk or consumer direct imports) or lower-cost Amazon refurbished/DIY alternatives.
2. "middleGrade": Standard dependable standard retail choice. Sourced from Amazon or Jumia (standard official African e-commerce) with solid warranty or Temu for direct manufactured wholesale tools.
3. "professional": Ultra professional premium grade and top performance industrial setup. Sourced from Amazon or custom specialized importers, customized premium brands.

Be highly detailed, creating between 4 to 8 crucial pieces of equipment, tools, or software items. Keep prices logical (Lower Grade < Middle Grade < Professional). Include conversion rates for local markets (NGN Nairas, GHS Cedis, EUR Euros) for easy calculations. All prices returned under lowerGrade.price, middleGrade.price, and professional.price must be in USD as the baseline, representing realistic market valuations, so that the custom budget calculator can compute totals seamlessly.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessName: { type: Type.STRING, description: "Name of the business or career (e.g. 'YouTube Content Creator', 'Home Catering & Bakery', 'Automobile Mechanic Workshop')" },
            industry: { type: Type.STRING, description: "General industry category (e.g. Media, Culinary, Trades, Beauty)" },
            summary: { type: Type.STRING, description: "A catchy one-sentence value proposition of this startup setup" },
            overview: { type: Type.STRING, description: "A high-quality 2-3 sentence overview explaining how this business sets up, what major hardware makes the difference, and a tip on choosing the tier." },
            usefulSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 useful skills to develop along with this equipment (e.g., Video Editing, Recipe formulation, Bookkeeping)"
            },
            licensingTips: { type: Type.STRING, description: "A brief regulatory note or general safety tip for setting up this specific trade legally (e.g. food handling permit for bakers, LLC configuration)" },
            keyCategories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "E.g., ['Inputs & Recording', 'Sound & Audio', 'Lighting & Support', 'Workstation & Software'] or relevant categories for this specific occupation"
            },
            equipment: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique snake_case identifier (e.g. 'primary_camera')" },
                  name: { type: Type.STRING, description: "Common name of the tool (e.g., 'Aperture Lens', 'Industrial Oven', 'Diagnostic Scanner')" },
                  category: { type: Type.STRING, description: "Must match one of the items listed in keyCategories" },
                  importance: { type: Type.STRING, description: "Either 'essential', 'recommended', or 'optional' depending on how critical it is to get started" },
                  description: { type: Type.STRING, description: "Short description of what function this item performs in the business" },
                  lowerGrade: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "The budget, secondhand, or DIY option name (e.g. 'Refurbished Canon M50' or 'Temu Budget Kit')" },
                      price: { type: Type.NUMBER, description: "Estimated price in USD (e.g., 280)" },
                      source: { type: Type.STRING, description: "Must be 'Jiji' or 'Jumia' or 'Amazon' or 'Temu'" },
                      sourceNotes: { type: Type.STRING, description: "Context such as 'Gently used on Jiji Lagos' or 'Sourced from Temu Global' or 'Refurbished on Amazon'" },
                      brandModel: { type: Type.STRING, description: "Short brand/model (e.g., 'Canon M50')" }
                    },
                    required: ["name", "price", "source", "sourceNotes", "brandModel"]
                  },
                  middleGrade: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "The standard professional entry-level option (e.g. 'Sony ZV-E10 with kit lens')" },
                      price: { type: Type.NUMBER, description: "Estimated price in USD (e.g., 699)" },
                      source: { type: Type.STRING, description: "Must be 'Amazon' or 'Jumia' or 'Jiji' or 'Temu'" },
                      sourceNotes: { type: Type.STRING, description: "Context such as 'Brand new retail on Amazon' or 'Official Jumia mall store' or 'Temu Direct Wholesale'" },
                      brandModel: { type: Type.STRING, description: "Short brand/model (e.g., 'Sony ZV-E10')" }
                    },
                    required: ["name", "price", "source", "sourceNotes", "brandModel"]
                  },
                  professional: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "The absolute premium/industrial workhorse Option (e.g. 'Sony FX3 + 24-70mm GMaster')" },
                      price: { type: Type.NUMBER, description: "Estimated premium price in USD (e.g., 3499)" },
                      source: { type: Type.STRING, description: "Must be 'Amazon' or 'Jumia' or 'Jiji' or 'Temu'" },
                      sourceNotes: { type: Type.STRING, description: "Context such as 'Amazon Prime Authorized reseller' or 'Specialty Professional Importer'" },
                      brandModel: { type: Type.STRING, description: "Short brand/model (e.g., 'Sony FX3')" }
                    },
                    required: ["name", "price", "source", "sourceNotes", "brandModel"]
                  }
                },
                required: ["id", "name", "category", "importance", "description", "lowerGrade", "middleGrade", "professional"]
              }
            },
            currencySymbol: { type: Type.STRING, description: "Always use '$'" },
            conversionRate: {
              type: Type.OBJECT,
              properties: {
                Naira: { type: Type.NUMBER, description: "Naira rate per USD, select a realistic current rate like 1500" },
                Cedis: { type: Type.NUMBER, description: "Ghanaian Cedi rate per USD, select a realistic rate like 14.8" },
                Euro: { type: Type.NUMBER, description: "Euro rate per USD, select a realistic rate like 0.92" }
              },
              required: ["Naira", "Cedis", "Euro"]
            }
          },
          required: ["businessName", "industry", "summary", "overview", "usefulSkills", "licensingTips", "keyCategories", "equipment", "currencySymbol", "conversionRate"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response generated by Gemini.");
    }

    const payload = JSON.parse(textOutput.trim());
    return res.json(payload);
  } catch (error: any) {
    console.error("Gemini Plan Generation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate setup plan." });
  }
});

// Configure Vite or Static File Assets serving
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

setupApp();

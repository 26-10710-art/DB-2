import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 10mb limit for base64 image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Lazy init of Gemini API
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// REST API endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint to analyze receipt
app.post("/api/analyze-receipt", async (req, res) => {
  try {
    const { image, useSample, sampleType } = req.body;

    // Define standard sample receipts if they select one or if Gemini API is unavailable
    const getSampleResponse = (type: string) => {
      if (type === "beef") {
        return [
          {
            name: "국산 한우 등심 400g",
            quantity: 1,
            price: 48000,
            carbonLevel: "high",
            carbonReason: "소고기 등 반추동물 육류는 사육 과정에서 대량의 메탄가스(이산화탄소의 21배 온실효과)를 배출하여 매우 높은 탄소 발자국을 남깁니다.",
            pointImpact: -50,
          },
          {
            name: "수입산 아보카도 (멕시코)",
            quantity: 2,
            price: 5900,
            carbonLevel: "high",
            carbonReason: "해외 수입 과일은 항공 또는 선박을 통한 장거리 운송 과정(푸드 마일리지)에서 막대한 이산화탄소를 배출합니다.",
            pointImpact: -30,
          },
          {
            name: "코카콜라 1.5L (플라스틱)",
            quantity: 1,
            price: 2900,
            carbonLevel: "high",
            carbonReason: "일회용 플라스틱 페트병 음료는 생산 및 폐기 과정에서 탄소 배출이 많으며 미세플라스틱 문제를 유발합니다.",
            pointImpact: -20,
          }
        ];
      } else if (type === "eco") {
        return [
          {
            name: "국산 국산콩 두부 300g",
            quantity: 2,
            price: 3600,
            carbonLevel: "low",
            carbonReason: "식물성 단백질인 두부는 육류 대비 이산화탄소 배출량이 1/10 이하로 우수하며, 국내산 원료 사용으로 운송 탄소도 최소화되었습니다.",
            pointImpact: 30,
          },
          {
            name: "유기농 시금치 1단 (친환경)",
            quantity: 1,
            price: 2400,
            carbonLevel: "low",
            carbonReason: "화학 비료와 농약을 사용하지 않는 친환경 유기농법은 토양의 탄소 저장 능력을 높이고 생산 과정의 탄소를 줄입니다.",
            pointImpact: 40,
          },
          {
            name: "대나무 칫솔 4개입",
            quantity: 1,
            price: 5500,
            carbonLevel: "low",
            carbonReason: "썩지 않는 플라스틱 대신 빠르게 생분해되는 지속 가능한 대나무 소재를 사용하여 자원 순환과 저탄소에 기여합니다.",
            pointImpact: 30,
          },
          {
            name: "텀블러 휴대용 세트",
            quantity: 1,
            price: 12000,
            carbonLevel: "low",
            carbonReason: "다회용 용기 및 제로 웨이스트 생활 도구는 수백 개의 일회용품 사용을 대체하여 온실가스를 감축합니다.",
            pointImpact: 50,
          }
        ];
      } else {
        // default / mixed
        return [
          {
            name: "무항생제 닭가슴살 500g",
            quantity: 1,
            price: 7900,
            carbonLevel: "medium",
            carbonReason: "닭고기는 소/돼지고기에 비해 메탄 배출과 사료 효율 면에서 온실가스 배출량이 비교적 적으나, 사육에 에너지가 소모됩니다.",
            pointImpact: -10,
          },
          {
            name: "신라면 5개입",
            quantity: 1,
            price: 4100,
            carbonLevel: "medium",
            carbonReason: "가공식품은 원료 재배, 대규모 공장 가공, 포장재 생산 등으로 평균 수준의 탄소를 배출합니다.",
            pointImpact: -15,
          },
          {
            name: "친환경 방울토마토 500g",
            quantity: 1,
            price: 4900,
            carbonLevel: "low",
            carbonReason: "저탄소/친환경 인증 채소류는 재배와 운송 과정에서 화석연료와 질소비료 사용을 줄여 환경에 무리가 적습니다.",
            pointImpact: 30,
          }
        ];
      }
    };

    if (useSample) {
      const items = getSampleResponse(sampleType || "mixed");
      return res.json({
        success: true,
        items,
        source: "sample",
        totalPointImpact: items.reduce((sum, item) => sum + item.pointImpact, 0),
      });
    }

    // Try Gemini API if image is present
    const ai = getGeminiClient();
    if (!ai) {
      console.log("Gemini API key is not configured or placeholder is used. Falling back to high-fidelity simulated response.");
      // Auto-fallback with randomized rich items so it always works perfectly in dev
      const randomTypes = ["beef", "eco", "mixed"];
      const selectedType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
      const items = getSampleResponse(selectedType);
      return res.json({
        success: true,
        items,
        source: "simulated_fallback",
        totalPointImpact: items.reduce((sum, item) => sum + item.pointImpact, 0),
        message: "Gemini API 키가 설정되지 않아 지능형 분석 시뮬레이션 결과가 반환되었습니다."
      });
    }

    if (!image) {
      return res.status(400).json({ error: "영수증 이미지나 샘플 조건이 필요합니다." });
    }

    // Parse base64 string
    const match = image.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: "올바르지 않은 이미지 포맷입니다." });
    }
    const mimeType = `image/${match[1]}`;
    const base64Data = match[2];

    const prompt = `Analyze this receipt image. Extract all line items (품목) purchased. For each item:
1. 'name': Korean name of the item.
2. 'quantity': Number of items bought.
3. 'price': Price of the item in Korean Won.
4. 'carbonLevel': Determine if this item has 'high', 'medium', or 'low' carbon emissions based on its ecological footprint.
   - 'high': Meat (especially beef, pork, lamb), imported food (e.g. avocado, mango), heavily processed food, plastic packaged drinks, single-use plastic cups, etc.
   - 'medium': Poultry (chicken), pork (sometimes medium but lean towards high), processed noodles, dairy, basic snacks, imported foods with lower mileage.
   - 'low': Fresh vegetables, plant-based foods (tofu, beans, grains), local agricultural products, eco-labeled products, sustainable materials (bamboo, paper), or reusable items (텀블러, 장바구니).
5. 'carbonReason': A short sentence in Korean explaining why this carbon rating is chosen (e.g. "소고기는 메탄가스 배출이...", "식물성 단백질 두부는 탄소배출이 적고...").
6. 'pointImpact': An integer score impact.
   - 'high' carbon items should DECREASE points (typically -20 to -50 points).
   - 'medium' carbon items should slightly decrease or be neutral (typically -10 to -15 points).
   - 'low' carbon items should INCREASE points (typically +20 to +50 points).

Provide the output strictly as a JSON list matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the item in Korean" },
              quantity: { type: Type.INTEGER, description: "Quantity purchased" },
              price: { type: Type.INTEGER, description: "Total or unit price in KRW" },
              carbonLevel: { type: Type.STRING, description: "high, medium, or low carbon level" },
              carbonReason: { type: Type.STRING, description: "Short explanation in Korean" },
              pointImpact: { type: Type.INTEGER, description: "Points earned (+) or reduced (-)" },
            },
            required: ["name", "quantity", "price", "carbonLevel", "carbonReason", "pointImpact"],
          },
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response from Gemini API");
    }

    const items = JSON.parse(textOutput.trim());
    return res.json({
      success: true,
      items,
      source: "gemini",
      totalPointImpact: items.reduce((sum: any, item: any) => sum + (item.pointImpact || 0), 0),
    });

  } catch (error: any) {
    console.error("Receipt analysis error:", error);
    res.status(500).json({
      error: "영수증 분석 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// Configure Vite or serve production build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();

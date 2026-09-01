import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/generate-paper", async (req, res) => {
  const { subject, className, difficulty = 'Medium', topics = '', marks = 100, questionTypes = ['MCQ', 'Short', 'Long'], language = 'auto' } = req.body;

  if (!subject || !className) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const isUrdu = language === 'urdu' ? true : language === 'english' ? false : /[\u0600-\u06FF]/.test(subject + className + topics);

  try {
    if (process.env.GEMINI_API_KEY) {
      const aiInstance = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

  const prompt = `You are an expert academic test generator for schools and colleges.
Generate a comprehensive examination paper strictly in ENGLISH for:
Subject: ${subject}
Class/Grade: ${className}
Difficulty Level: ${difficulty}
Topics Covered: ${topics || 'General Syllabus'}
Total Marks: ${marks}
Question Types: ${Array.isArray(questionTypes) ? questionTypes.join(", ") : questionTypes}

Format the output strictly as a JSON object with this exact structure:
{
  "title": "Exam Paper Title",
  "sections": [
    {
      "sectionTitle": "Section Title",
      "questions": [
        {
          "text": "Question text here",
          "marks": 5,
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
        }
      ]
    }
  ]
}

Ensure questions are high-quality, academic, and well-proportioned to the total marks (${marks}).
Do NOT wrap output in markdown code blocks, return raw JSON string.`;

      const response = await aiInstance.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let cleanText = response.text || "";
      cleanText = cleanText.replace(/```json/g, "").replace(/```/g, "").trim();
      return res.json(JSON.parse(cleanText));
    }
  } catch (error: any) {
    console.error("Gemini Generation Error:", error?.message || error);
  }

  // Fallback response if API key missing or call fails
  const mockPaper = {
    title: `${subject} Examination (${className})`,
    sections: [
      {
        sectionTitle: "Section A: Multiple Choice Questions",
        questions: [
          {
            text: `Select the correct fundamental concept for ${subject}.`,
            marks: 2,
            options: ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"]
          },
          {
            text: `Which of the following is a primary component of ${topics || subject}?`,
            marks: 2,
            options: ["A) Component 1", "B) Component 2", "C) Component 3", "D) Component 4"]
          }
        ]
      },
      {
        sectionTitle: "Section B: Short Answer Questions",
        questions: [
          {
            text: `Define ${topics || subject} and describe its key characteristics.`,
            marks: 5
          },
          {
            text: `Explain the importance of ${topics || 'key topics'} in ${subject}.`,
            marks: 5
          }
        ]
      },
      {
        sectionTitle: "Section C: Comprehensive Questions",
        questions: [
          {
            text: `Write a detailed note on ${topics || subject} with relevant examples.`,
            marks: Math.max(10, (Number(marks) || 100) - 14)
          }
        ]
      }
    ]
  };

  return res.json(mockPaper);
});

app.post("/api/ai-assistant", async (req, res) => {
  const { tool, input } = req.body;

  if (!input) return res.status(400).json({ error: "Input is required" });

  try {
    if (process.env.GEMINI_API_KEY) {
      const aiInstance = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      let prompt = "";
      if (tool === 'report-card') prompt = `Generate a personalized report card comment for a student based on these details: ${input}`;
      else if (tool === 'fee-reminder') prompt = `Draft a polite fee reminder message for school parents. Details: ${input}`;
      else if (tool === 'notice') prompt = `Write a professional school notice/circular. Subject: ${input}`;
      else if (tool === 'quiz') prompt = `Generate a 5-question quiz for school students on this topic: ${input}`;
      else if (tool === 'planner') prompt = `Create a school event plan and schedule for: ${input}`;
      else if (tool === 'homework') prompt = `Explain this topic simply for school students and give 3 homework questions: ${input}`;
      else prompt = input;

      const result = await aiInstance.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt
      });

      return res.json({ text: result.text });
    }
  } catch (err: any) {
    console.error(err);
  }

  // Mock
  let dummy = "AI generation is not available at the moment. Please check your configuration.";
  if (tool === 'report-card') dummy = "Ahmed has shown exceptional growth this term. His participation in class discussions is commendable.";
  if (tool === 'fee-reminder') dummy = "Dear Parent, this is a friendly reminder regarding the outstanding school fees for the month of August.";

  res.json({ text: dummy });
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded papers statically
app.use("/uploads", express.static(uploadsDir));

app.post("/api/upload-paper", async (req, res) => {
  const { fileName, fileData } = req.body;
  if (!fileName || !fileData) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(fileData, "base64");
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return res.json({ success: true, path: `/uploads/${fileName}` });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message || "Failed to save file" });
  }
});

// Vite middleware setup
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduCore ERP Server running on http://localhost:${PORT}`);
  });
}

setupServer();

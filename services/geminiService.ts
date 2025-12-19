
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingResult } from "../types";
import { blobToBase64 } from "./utils";

// Initializing the Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const processMeetingAudio = async (audioBlob: Blob): Promise<ProcessingResult> => {
  try {
    const base64Audio = await blobToBase64(audioBlob);

    // Schema definition for structured output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        transcript: {
          type: Type.STRING,
          description: "De letterlijke transcriptie van het gesprek.",
        },
        summary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              theme: { type: Type.STRING, description: "De naam van het thema." },
              points: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "De inhoudelijke punten behorende bij dit thema."
              }
            },
            required: ["theme", "points"]
          },
          description: "Een samenvatting gegroepeerd per thema. Maak duidelijke thema's aan.",
        },
        actionItems: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Een lijst met concrete actiepunten.",
        },
        calendarEvents: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              startDateTime: { 
                type: Type.STRING, 
                description: "ISO 8601 formaat datum/tijd voor het begin van de afspraak. Schat in op basis van context (bv. 'volgende week maandag om 9 uur'). Gebruik het huidige jaar." 
              },
              location: { type: Type.STRING },
            },
            required: ["title", "description"],
          },
          description: "Afspraken of meetings die expliciet genoemd worden en ingepland moeten worden.",
        },
      },
      required: ["transcript", "summary", "actionItems", "calendarEvents"],
    };

    // Use the recommended Gemini model for text and multi-modal tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || "audio/webm",
              data: base64Audio,
            },
          },
          {
            text: `Je bent een professionele notulist. Luister naar dit audiobestand (een opgenomen gesprek of meeting).
            
            Voer de volgende taken uit:
            1. Transcribeer het gesprek volledig.
            2. Maak een samenvatting gegroepeerd per THEMA. Identificeer de belangrijkste onderwerpen die besproken zijn. Per thema geef je een lijst met punten.
            3. Haal concrete actiepunten uit het gesprek.
            4. Als er specifieke vervolgafspraken of meetings worden genoemd (met een tijdsaanduiding), extraheer deze dan voor de agenda.
            
            Huidige datum voor referentie: ${new Date().toLocaleDateString('nl-NL')}.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (!response.text) {
      throw new Error("Geen reactie ontvangen van Gemini.");
    }

    const result = JSON.parse(response.text) as ProcessingResult;
    return result;

  } catch (error) {
    console.error("Fout bij verwerken audio:", error);
    throw error;
  }
};

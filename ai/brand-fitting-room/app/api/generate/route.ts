import { NextRequest } from "next/server";
import { OpenRouter } from "@openrouter/sdk";

export const runtime = "nodejs";
export const maxDuration = 120;

const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.API_KEY;

const client = apiKey ? new OpenRouter({ apiKey }) : null;

const MODEL = "google/gemini-3.1-flash-image-preview";

type Body = {
  logo: string;
  prompt: string;
  aspectRatio: string;
  imageSize: string;
};

export async function POST(req: NextRequest) {
  if (!client) {
    return Response.json(
      { error: "Missing OPENROUTER_API_KEY (or API_KEY) in environment." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { logo, prompt, aspectRatio, imageSize } = body;

  if (!logo?.startsWith("data:image/")) {
    return Response.json(
      { error: "Logo must be a data: URL." },
      { status: 400 },
    );
  }
  if (!prompt?.trim()) {
    return Response.json({ error: "Prompt is required." }, { status: 400 });
  }

  try {
    const response = await client.chat.send({
      chatRequest: {
        model: MODEL,
        modalities: ["image", "text"],
        imageConfig: {
          aspect_ratio: aspectRatio,
          image_size: imageSize,
        },
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", imageUrl: { url: logo } },
              { type: "text", text: prompt },
            ],
          },
        ],
      },
    });

    const url = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (response as any)?.choices?.[0]?.message?.images?.[0]?.imageUrl?.url;

    if (typeof url !== "string") {
      return Response.json(
        { error: "Model did not return an image. Try again or adjust prompt." },
        { status: 502 },
      );
    }

    return Response.json({ url });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    console.error("[/api/generate] failed", {
      name: e?.name,
      message: e?.message,
      status: e?.statusCode ?? e?.status,
      body: e?.body ?? e?.rawValue,
      cause: e?.cause?.message,
    });
    const message = e?.message ?? "Unknown generation error.";
    return Response.json({ error: message }, { status: 500 });
  }
}

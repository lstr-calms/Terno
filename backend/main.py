import os
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="Terno Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY in .env file")

USE_MOCK_AI = os.getenv("USE_MOCK_AI", "false").lower() == "true"

client = genai.Client(api_key=GEMINI_API_KEY)


@app.get("/")
def home():
    return {"message": "Ternobackend is running"}


@app.post("/analyze-clothing")
async def analyze_clothing(
    image: UploadFile = File(...),
    occasion: str = Form(...),
    preferences: str = Form(None)
    
):
    
    try:
        image_bytes = await image.read()
        user_preferences = {}
        
        if preferences:
            try:
                user_preferences = json.loads(preferences)
            except Exception:
                user_preferences = {}
        if USE_MOCK_AI:
            return {
        "status": "success",
        "occasion": occasion,
        "preferences_used": user_preferences,
        "detected_item": {
            "category": "shirt",
            "main_color": "black",
            "secondary_colors": [],
            "pattern": "plain",
            "material": "cotton or cotton blend",
            "fit": "regular or oversized",
            "style": "casual",
            "formality": "casual",
            "description": "A simple black casual shirt."
        },
        "recommendations": [
            {
                "title": "Casual Clean Fit",
                "occasion": occasion,
                "use_uploaded_item_as": "top",
                "top": "Uploaded black shirt",
                "bottom": "light-wash straight jeans",
                "shoes": "clean white sneakers",
                "outerwear": "optional denim jacket",
                "accessories": "silver watch or simple bracelet",
                "color_reasoning": "Black pairs well with light denim and white because it creates clean contrast.",
                "style_reasoning": "This keeps the outfit simple, relaxed, and easy to wear.",
                "why_this_is_best": "It is beginner-friendly and works for most casual situations.",
                "avoid": "Avoid pairing it with too many dark pieces unless you want an all-black look."
            },
            {
                "title": "Smart Casual Fit",
                "occasion": occasion,
                "use_uploaded_item_as": "top",
                "top": "Uploaded black shirt",
                "bottom": "beige chinos",
                "shoes": "brown loafers or minimalist sneakers",
                "outerwear": "lightweight overshirt",
                "accessories": "leather belt and watch",
                "color_reasoning": "Beige softens the black shirt and makes the outfit look more polished.",
                "style_reasoning": "Chinos make the outfit cleaner without becoming too formal.",
                "why_this_is_best": "It works well when you want to look neat but not overdressed.",
                "avoid": "Avoid sporty shoes if you want the outfit to look smart casual."
            },
            {
                "title": "Streetwear Fit",
                "occasion": occasion,
                "use_uploaded_item_as": "top",
                "top": "Uploaded black shirt",
                "bottom": "black cargo pants",
                "shoes": "chunky sneakers",
                "outerwear": "oversized denim or bomber jacket",
                "accessories": "crossbody bag",
                "color_reasoning": "The mostly dark palette creates a stronger streetwear feel.",
                "style_reasoning": "Cargo pants and chunky sneakers match the casual silhouette.",
                "why_this_is_best": "It gives the item a more styled and intentional look.",
                "avoid": "Avoid formal shoes because they clash with the streetwear direction."
            }
        ]
    };

        prompt = f"""
You are an expert AI fashion stylist for people who are not fashion-savvy.

The user uploaded a picture of one clothing item. Your job is to identify the uploaded item and recommend the best complete outfit combinations that match it.

Selected occasion: {occasion}

User style preferences: {json.dumps(user_preferences, indent=2)}

Analyze the uploaded clothing item:
1. Clothing category
2. Main color
3. Secondary colors
4. Pattern
5. Visible material
6. Fit or silhouette if visible
7. Style category
8. Formality level

Then recommend exactly 3 complete outfit combinations based on the uploaded item.

Each outfit must include:
- bottom wear
- shoes
- optional outerwear
- accessories
- color reasoning
- style reasoning
- what to avoid

Rules:
- The uploaded clothing item must be treated as the main piece of the outfit.
- Do not replace the uploaded item.
- Recommend clothes that pair well with the uploaded item.
- Make the suggestions practical and wearable.
- Explain why the combination works in simple language.
- Avoid vague suggestions like "nice pants" or "stylish shoes."
- Do not suggest luxury brands unless necessary.
- If the uploaded item is a bottom, recommend a top instead of another bottom.
- If the uploaded item is shoes, recommend top and bottom combinations.
- If the uploaded item is outerwear, recommend inner top, bottom, and shoes.
- If the uploaded item is a dress, recommend shoes, outerwear, and accessories.
- Keep the advice beginner-friendly.

Return only valid JSON. Do not include markdown. Do not include text outside the JSON.

Use this exact structure:
{{
  "detected_item": {{
    "category": "",
    "main_color": "",
    "secondary_colors": [],
    "pattern": "",
    "material": "",
    "fit": "",
    "style": "",
    "formality": "",
    "description": ""
  }},
  "recommendations": [
    {{
      "title": "",
      "occasion": "{occasion}",
      "use_uploaded_item_as": "",
      "top": "",
      "bottom": "",
      "shoes": "",
      "outerwear": "",
      "accessories": "",
      "color_reasoning": "",
      "style_reasoning": "",
      "why_this_is_best": "",
      "avoid": ""
    }},
    {{
      "title": "",
      "occasion": "{occasion}",
      "use_uploaded_item_as": "",
      "top": "",
      "bottom": "",
      "shoes": "",
      "outerwear": "",
      "accessories": "",
      "color_reasoning": "",
      "style_reasoning": "",
      "why_this_is_best": "",
      "avoid": ""
    }},
    {{
      "title": "",
      "occasion": "{occasion}",
      "use_uploaded_item_as": "",
      "top": "",
      "bottom": "",
      "shoes": "",
      "outerwear": "",
      "accessories": "",
      "color_reasoning": "",
      "style_reasoning": "",
      "why_this_is_best": "",
      "avoid": ""
    }}
  ]
}}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=image.content_type or "image/jpeg",
                ),
                prompt,
            ],
        )

        raw_text = response.text.strip()

        # Remove possible markdown fences just in case
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        parsed_result = json.loads(raw_text)

        return {
            "status": "success",
            "occasion": occasion,
            "detected_item": parsed_result.get("detected_item"),
            "recommendations": parsed_result.get("recommendations"),
        }

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="AI returned invalid JSON. Try again with a clearer clothing image."
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
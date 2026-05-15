import os
import json
import base64
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
IMAGE_GENERATION_MODELS = [
    model.strip()
    for model in os.getenv(
        "IMAGE_GENERATION_MODELS",
        "gemini-3.1-flash-image-preview,gemini-2.5-flash-image",
    ).split(",")
    if model.strip()
]

client = genai.Client(api_key=GEMINI_API_KEY)


@app.get("/")
def home():
    return {"message": "Ternobackend is running"}


@app.post("/generate-look-preview")
async def generate_look_preview(
    image: UploadFile = File(...),
    recommendation: str = Form(...),
):
    try:
        image_bytes = await image.read()

        try:
            recommendation_data = json.loads(recommendation)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid recommendation JSON.")

        if USE_MOCK_AI:
            return {
                "status": "success",
                "image_data_uri": (
                    "https://images.unsplash.com/photo-1496747611176-843222e1e57c"
                    "?auto=format&fit=crop&w=900&q=80"
                ),
            }

        prompt = f"""
Create one realistic fashion preview image for this recommended outfit.

Use the uploaded clothing item as the main piece. The generated image should show a complete outfit laid out like an editorial flat lay or clean e-commerce outfit board, not a person wearing it.

Recommended look:
- Title: {recommendation_data.get("title", "Recommended look")}
- Uploaded item role: {recommendation_data.get("use_uploaded_item_as", "main clothing item")}
- Top: {recommendation_data.get("top", "uploaded item if applicable")}
- Bottom: {recommendation_data.get("bottom", "not specified")}
- Shoes: {recommendation_data.get("shoes", "not specified")}
- Outerwear: {recommendation_data.get("outerwear", "optional")}
- Accessories: {recommendation_data.get("accessories", "optional")}
- Occasion: {recommendation_data.get("occasion", "casual")}

Image requirements:
- Preserve the uploaded item's color and general style as much as possible.
- Show all recommended pieces together as a cohesive outfit.
- Use a clean warm neutral background.
- Make it photorealistic, bright, and easy to inspect on a mobile phone.
- Do not include text, labels, logos, watermarks, hands, faces, or mannequins.
- Vertical 4:5 composition.
"""

        last_error = None
        for model in IMAGE_GENERATION_MODELS:
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=[
                        types.Part.from_bytes(
                            data=image_bytes,
                            mime_type=image.content_type or "image/jpeg",
                        ),
                        prompt,
                    ],
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(aspect_ratio="4:5"),
                    ),
                )

                for part in getattr(response, "parts", []) or []:
                    inline_data = getattr(part, "inline_data", None)
                    if inline_data is not None and getattr(inline_data, "data", None):
                        image_data = inline_data.data
                        if isinstance(image_data, str):
                            encoded_image = image_data
                        else:
                            encoded_image = base64.b64encode(image_data).decode("utf-8")
                        mime_type = getattr(inline_data, "mime_type", None) or "image/png"

                        return {
                            "status": "success",
                            "model": model,
                            "image_data_uri": f"data:{mime_type};base64,{encoded_image}",
                        }

                raise RuntimeError("Image model did not return image data.")
            except Exception as model_error:
                last_error = model_error

        raise HTTPException(
            status_code=500,
            detail=f"Could not generate AI look preview: {last_error}",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-clothing")
async def analyze_clothing(
    image: UploadFile = File(...),
    occasion: str = Form(...),
    preferences: str = Form(None),
    wardrobe: str = Form(None),
    regenerate: bool = Form(False)
):
    try:
        image_bytes = await image.read()
        user_preferences = {}
        user_wardrobe = []
        
        if preferences:
            try:
                user_preferences = json.loads(preferences)
            except Exception:
                user_preferences = {}
                
        if wardrobe:
            try:
                user_wardrobe = json.loads(wardrobe)
            except Exception:
                user_wardrobe = []

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
                        "compatibility_score": 95,
                        "color_score": 90,
                        "occasion_score": 85,
                        "style_score": 92,
                        "color_reasoning": "Black pairs well with light denim and white because it creates clean contrast.",
                        "style_reasoning": "This keeps the outfit simple, relaxed, and easy to wear.",
                        "occasion_reasoning": "Perfect for casual days, pasyal, or running errands.",
                        "beginner_tip": "Roll up the sleeves slightly for a more relaxed look.",
                        "why_this_is_best": "It is beginner-friendly and works for most casual situations.",
                        "avoid": "Avoid pairing it with too many dark pieces unless you want an all-black look.",
                        "used_wardrobe_items": []
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
                        "compatibility_score": 88,
                        "color_score": 95,
                        "occasion_score": 90,
                        "style_score": 85,
                        "color_reasoning": "Beige softens the black shirt and makes the outfit look more polished.",
                        "style_reasoning": "Chinos make the outfit cleaner without becoming too formal.",
                        "occasion_reasoning": "Great for dates or casual Fridays at work.",
                        "beginner_tip": "Tuck in the shirt to elevate the smart casual feel.",
                        "why_this_is_best": "It works well when you want to look neat but not overdressed.",
                        "avoid": "Avoid sporty shoes if you want the outfit to look smart casual.",
                        "used_wardrobe_items": []
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
                        "compatibility_score": 80,
                        "color_score": 85,
                        "occasion_score": 75,
                        "style_score": 90,
                        "color_reasoning": "The mostly dark palette creates a stronger streetwear feel.",
                        "style_reasoning": "Cargo pants and chunky sneakers match the casual silhouette.",
                        "occasion_reasoning": "Good for weekend hangouts or parties.",
                        "beginner_tip": "Make sure the pants fit loose enough to drape over the chunky shoes.",
                        "why_this_is_best": "It gives the item a more styled and intentional look.",
                        "avoid": "Avoid formal shoes because they clash with the streetwear direction.",
                        "used_wardrobe_items": []
                    }
                ]
            }

        prompt = f"""
You are an expert AI fashion stylist for people who are not fashion-savvy.

The user uploaded a picture of one clothing item. Your job is to identify the uploaded item and recommend the best complete outfit combinations that match it.

Selected occasion: {occasion}

User style preferences: {json.dumps(user_preferences, indent=2)}

User wardrobe items: {json.dumps(user_wardrobe, indent=2) if user_wardrobe else "None provided"}

Regenerate mode: {"Yes, please provide different outfit combinations than the previous ones." if regenerate else "No, this is a fresh request."}

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
- compatibility, color, occasion, and style scores (0-100)
- reasoning fields (color, style, occasion)
- beginner tip
- what to avoid

Rules:
- The uploaded clothing item must be treated as the main piece of the outfit.
- Do not replace the uploaded item.
- When possible and appropriate, incorporate items from the "User wardrobe items" list to build the outfit.
- Make the suggestions practical and wearable. Consider Philippine weather: hot and humid climate, rainy season practicality, breathable fabrics, commute-friendly shoes, avoid heavy layering unless appropriate, avoid delicate shoes during rainy day occasion.
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
      "compatibility_score": 0,
      "color_score": 0,
      "occasion_score": 0,
      "style_score": 0,
      "color_reasoning": "",
      "style_reasoning": "",
      "occasion_reasoning": "",
      "beginner_tip": "",
      "why_this_is_best": "",
      "avoid": "",
      "used_wardrobe_items": []
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
      "compatibility_score": 0,
      "color_score": 0,
      "occasion_score": 0,
      "style_score": 0,
      "color_reasoning": "",
      "style_reasoning": "",
      "occasion_reasoning": "",
      "beginner_tip": "",
      "why_this_is_best": "",
      "avoid": "",
      "used_wardrobe_items": []
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
      "compatibility_score": 0,
      "color_score": 0,
      "occasion_score": 0,
      "style_score": 0,
      "color_reasoning": "",
      "style_reasoning": "",
      "occasion_reasoning": "",
      "beginner_tip": "",
      "why_this_is_best": "",
      "avoid": "",
      "used_wardrobe_items": []
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

import type { Recommendation } from "@/types/terno";

export type CatalogCategory =
  | "top"
  | "bottom"
  | "shoes"
  | "outerwear"
  | "accessories";

export type CatalogItem = {
  id: string;
  category: CatalogCategory;
  name: string;
  imageUrl: string;
  keywords: string[];
  colors: string[];
  occasions?: string[];
};

export type LookPreviewItem = {
  category: CatalogCategory;
  label: string;
  description: string;
  imageUri?: string;
  catalogItem?: CatalogItem;
  isUploadedItem: boolean;
  isOptional: boolean;
};

const catalogItems: CatalogItem[] = [
  {
    id: "top-black-shirt",
    category: "top",
    name: "Black casual shirt",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
    keywords: ["black", "shirt", "tee", "t-shirt", "casual", "cotton"],
    colors: ["black"],
    occasions: ["Casual", "School", "Party"],
  },
  {
    id: "top-white-shirt",
    category: "top",
    name: "White button shirt",
    imageUrl:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=80",
    keywords: ["white", "button", "shirt", "polo", "smart", "formal"],
    colors: ["white"],
    occasions: ["Work", "Interview", "Date"],
  },
  {
    id: "bottom-light-jeans",
    category: "bottom",
    name: "Light-wash straight jeans",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80",
    keywords: ["light", "wash", "straight", "jeans", "denim", "pants"],
    colors: ["blue", "denim"],
    occasions: ["Casual", "School", "Date"],
  },
  {
    id: "bottom-beige-chinos",
    category: "bottom",
    name: "Beige chinos",
    imageUrl:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80",
    keywords: ["beige", "chinos", "khaki", "trousers", "pants", "smart"],
    colors: ["beige", "khaki"],
    occasions: ["Work", "Interview", "Date"],
  },
  {
    id: "bottom-black-cargo",
    category: "bottom",
    name: "Black cargo pants",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
    keywords: ["black", "cargo", "pants", "streetwear", "relaxed"],
    colors: ["black"],
    occasions: ["Casual", "Party"],
  },
  {
    id: "shoes-white-sneakers",
    category: "shoes",
    name: "Clean white sneakers",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    keywords: ["white", "clean", "sneakers", "minimalist", "shoes"],
    colors: ["white"],
    occasions: ["Casual", "School", "Date"],
  },
  {
    id: "shoes-brown-loafers",
    category: "shoes",
    name: "Brown loafers",
    imageUrl:
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=80",
    keywords: ["brown", "leather", "loafers", "smart", "formal", "shoes"],
    colors: ["brown"],
    occasions: ["Work", "Interview", "Date"],
  },
  {
    id: "shoes-chunky-sneakers",
    category: "shoes",
    name: "Chunky sneakers",
    imageUrl:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=700&q=80",
    keywords: ["chunky", "sneakers", "streetwear", "shoes"],
    colors: ["white", "gray"],
    occasions: ["Casual", "Party"],
  },
  {
    id: "outerwear-denim-jacket",
    category: "outerwear",
    name: "Denim jacket",
    imageUrl:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=80",
    keywords: ["denim", "jacket", "outerwear", "layer", "blue"],
    colors: ["blue", "denim"],
    occasions: ["Casual", "School", "Date"],
  },
  {
    id: "outerwear-bomber",
    category: "outerwear",
    name: "Bomber jacket",
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80",
    keywords: ["bomber", "jacket", "outerwear", "streetwear", "black"],
    colors: ["black"],
    occasions: ["Casual", "Party"],
  },
  {
    id: "outerwear-overshirt",
    category: "outerwear",
    name: "Lightweight overshirt",
    imageUrl:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=700&q=80",
    keywords: ["lightweight", "overshirt", "shirt", "outerwear", "layer"],
    colors: ["beige", "white"],
    occasions: ["Work", "Date", "Casual"],
  },
  {
    id: "accessory-watch",
    category: "accessories",
    name: "Simple watch",
    imageUrl:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=700&q=80",
    keywords: ["watch", "silver", "leather", "accessories", "bracelet"],
    colors: ["silver", "brown"],
    occasions: ["Work", "Interview", "Date", "Casual"],
  },
  {
    id: "accessory-crossbody",
    category: "accessories",
    name: "Crossbody bag",
    imageUrl:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=700&q=80",
    keywords: ["crossbody", "bag", "streetwear", "accessories", "black"],
    colors: ["black"],
    occasions: ["Casual", "School", "Party"],
  },
  {
    id: "accessory-belt",
    category: "accessories",
    name: "Leather belt",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
    keywords: ["belt", "leather", "brown", "accessories"],
    colors: ["brown"],
    occasions: ["Work", "Interview", "Date"],
  },
];

const categoryLabels: Record<CatalogCategory, string> = {
  top: "Top",
  bottom: "Bottom",
  shoes: "Shoes",
  outerwear: "Layer",
  accessories: "Extras",
};

const recommendationFields: Record<CatalogCategory, keyof Recommendation> = {
  top: "top",
  bottom: "bottom",
  shoes: "shoes",
  outerwear: "outerwear",
  accessories: "accessories",
};

const optionalPatterns = [
  /\boptional\b/i,
  /\bnot needed\b/i,
  /\bnot specified\b/i,
  /\bnone\b/i,
  /\bn\/a\b/i,
];

function normalize(value?: string) {
  return (value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
}

function textTokens(value?: string) {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function isOptionalValue(value?: string) {
  return !value || optionalPatterns.some((pattern) => pattern.test(value));
}

function uploadedItemCategory(recommendation: Recommendation): CatalogCategory {
  const slot = normalize(recommendation.use_uploaded_item_as);

  if (slot.includes("bottom") || slot.includes("pants")) {
    return "bottom";
  }

  if (slot.includes("shoe")) {
    return "shoes";
  }

  if (slot.includes("outer") || slot.includes("jacket") || slot.includes("layer")) {
    return "outerwear";
  }

  if (slot.includes("accessor")) {
    return "accessories";
  }

  if (slot.includes("dress")) {
    return "top";
  }

  return "top";
}

function scoreCatalogItem(item: CatalogItem, text: string, occasion?: string) {
  const normalizedText = normalize(text);
  const tokens = textTokens(text);
  let score = 0;

  for (const keyword of item.keywords) {
    const normalizedKeyword = normalize(keyword).trim();

    if (normalizedKeyword && normalizedText.includes(normalizedKeyword)) {
      score += normalizedKeyword.includes(" ") ? 6 : 3;
    }
  }

  for (const color of item.colors) {
    if (normalizedText.includes(normalize(color).trim())) {
      score += 2;
    }
  }

  for (const token of tokens) {
    if (item.keywords.some((keyword) => normalize(keyword).trim() === token)) {
      score += 1;
    }
  }

  if (occasion && item.occasions?.includes(occasion)) {
    score += 1;
  }

  return score;
}

function findCatalogMatch(
  category: CatalogCategory,
  description: string,
  occasion?: string
) {
  const candidates = catalogItems.filter((item) => item.category === category);
  const [bestMatch] = candidates
    .map((item) => ({
      item,
      score: scoreCatalogItem(item, description, occasion),
    }))
    .sort((a, b) => b.score - a.score);

  return bestMatch && bestMatch.score > 0 ? bestMatch.item : undefined;
}

export function getLookPreviewItems(
  recommendation: Recommendation,
  uploadedImageUri?: string | null
): LookPreviewItem[] {
  const uploadedCategory = uploadedItemCategory(recommendation);

  return (Object.keys(recommendationFields) as CatalogCategory[]).map(
    (category) => {
      const field = recommendationFields[category];
      const rawValue = recommendation[field];
      const description =
        typeof rawValue === "string" && rawValue.trim().length > 0
          ? rawValue.trim()
          : category === uploadedCategory
            ? "Uploaded item"
            : category === "outerwear" || category === "accessories"
              ? "Optional"
              : "Not specified";
      const isUploadedItem =
        category === uploadedCategory ||
        /\buploaded\b/i.test(description);
      const isOptional = !isUploadedItem && isOptionalValue(description);
      const catalogItem =
        !isUploadedItem && !isOptional
          ? findCatalogMatch(category, description, recommendation.occasion)
          : undefined;

      return {
        category,
        label: categoryLabels[category],
        description,
        imageUri: isUploadedItem ? uploadedImageUri || undefined : catalogItem?.imageUrl,
        catalogItem,
        isUploadedItem,
        isOptional,
      };
    }
  );
}

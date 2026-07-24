// Deterministic (no-LLM, no-API-key) column-mapping suggester for the bulk product/image
// import wizard. Given the headers of an uploaded CSV/XLSX and the set of possible targets
// (reserved product fields + the company's taxonomy attributes), guess a header -> target
// mapping so the human only has to confirm/correct via dropdown rather than map every column
// from scratch. Canonical keys for reserved targets MUST match the server's lowercase
// `RESERVED` set in product-import.service.ts (handle, name, category, description, material,
// sku, price, originalprice, stock, moq, imageurl, images, visibility, ownercompanyid) --
// getting one wrong means the server silently treats that column as an attribute (or drops it).

export interface MapTarget {
  key: string; // canonical row key ('' = ignore this column)
  label: string;
  synonyms: string[];
}

// Reserved product/variant fields the server import pipeline understands directly.
export const RESERVED_TARGETS: MapTarget[] = [
  { key: 'handle', label: 'Handle', synonyms: ['handle', 'slug', 'url handle', 'product handle'] },
  { key: 'name', label: 'Name', synonyms: ['name', 'title', 'product name', 'product title', 'item', 'item name'] },
  { key: 'category', label: 'Category', synonyms: ['category', 'cat', 'type', 'product category'] },
  { key: 'description', label: 'Description', synonyms: ['description', 'desc', 'details', 'product description'] },
  { key: 'material', label: 'Material', synonyms: ['material', 'materials', 'fabric', 'made of'] },
  { key: 'sku', label: 'SKU', synonyms: ['sku', 'sku code', 'item code', 'product code', 'code'] },
  { key: 'price', label: 'Price', synonyms: ['price', 'mrp', 'rate', 'selling price', 'unit price', 'sale price', 'cost'] },
  {
    key: 'originalprice',
    label: 'OriginalPrice',
    synonyms: ['originalprice', 'original price', 'list price', 'compare at price', 'strike price', 'mrp original'],
  },
  { key: 'stock', label: 'Stock', synonyms: ['stock', 'qty', 'quantity', 'inventory', 'stock qty', 'available stock'] },
  { key: 'moq', label: 'MOQ', synonyms: ['moq', 'minimum order quantity', 'min order qty', 'min qty'] },
  {
    key: 'imageurl',
    label: 'ImageUrl',
    synonyms: ['imageurl', 'image url', 'image link', 'img url', 'picture url'],
  },
  { key: 'images', label: 'Images', synonyms: ['images', 'image', 'photos', 'image files', 'gallery', 'pictures'] },
  { key: 'visibility', label: 'Visibility', synonyms: ['visibility', 'status', 'published', 'visible', 'active'] },
  {
    key: 'ownercompanyid',
    label: 'OwnerCompanyId',
    synonyms: ['ownercompanyid', 'owner company id', 'company id', 'companyid', 'owner company'],
  },
];

// Extra synonyms for common taxonomy attribute names. Attribute names themselves come from the
// DB at runtime (buildTargets' argument), so this table only covers well-known ones; anything
// else still works via its own name/label (exact or fuzzy) with no extra synonyms.
const ATTRIBUTE_SYNONYMS: Record<string, string[]> = {
  color: ['colour', 'colours', 'colors', 'col'],
  size: ['sizes', 'dimension', 'dimensions'],
  capacity: ['volume', 'vol'],
  weight: ['wt', 'mass'],
  material: ['materials', 'fabric'],
  finish: ['texture'],
  pattern: ['design', 'print'],
  style: ['variant', 'variant type'],
};

const IGNORE_TARGET: MapTarget = {
  key: '',
  label: 'Ignore',
  synonyms: ['ignore', 'skip', 'na', 'n a', 'do not import', 'none', 'blank'],
};

// Build the full target list for a mapping session: reserved fields + one target per (active)
// taxonomy attribute + a trailing "ignore this column" option.
export function buildTargets(attributeNames: string[]): MapTarget[] {
  const attributeTargets: MapTarget[] = attributeNames.map((name) => {
    const normalized = normalize(name);
    const extraSynonyms = ATTRIBUTE_SYNONYMS[normalized] ?? [];
    return { key: name.toLowerCase(), label: name, synonyms: extraSynonyms };
  });
  return [...RESERVED_TARGETS, ...attributeTargets, IGNORE_TARGET];
}

// Normalize a header/synonym for comparison: lowercase, strip everything but letters/digits.
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Classic Levenshtein edit distance (single-row DP, O(min(m,n)) space).
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prevRow = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const currRow = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1, // deletion
        currRow[j - 1] + 1, // insertion
        prevRow[j - 1] + cost, // substitution
      );
    }
    prevRow = currRow;
  }
  return prevRow[b.length];
}

const FUZZY_MAX_DISTANCE = 2;

// Suggest a header -> target.key mapping. Deterministic, no network/LLM call: normalize each
// header, try an exact match against every target's normalized label/key/synonyms first, then
// fall back to the closest match within FUZZY_MAX_DISTANCE. Anything left over maps to ''
// (ignore) -- the human confirms/corrects the whole table via dropdown downstream, so this only
// needs to save clicks, not be perfect.
export function suggestMapping(headers: string[], targets: MapTarget[]): Record<string, string> {
  const candidates = targets.map((target) => {
    const normalizedSynonyms = new Set<string>([normalize(target.label), normalize(target.key), ...target.synonyms.map(normalize)]);
    normalizedSynonyms.delete(''); // don't let an empty key/label/synonym match blank headers
    return { target, normalizedSynonyms };
  });

  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const normalizedHeader = normalize(header);
    mapping[header] = normalizedHeader ? matchOne(normalizedHeader, candidates) : '';
  }

  return mapping;
}

function matchOne(
  normalizedHeader: string,
  candidates: { target: MapTarget; normalizedSynonyms: Set<string> }[],
): string {
  // Exact pass.
  for (const { target, normalizedSynonyms } of candidates) {
    if (normalizedSynonyms.has(normalizedHeader)) return target.key;
  }

  // Fuzzy pass: closest synonym across all targets, within the distance budget.
  let bestKey = '';
  let bestDistance = FUZZY_MAX_DISTANCE + 1;
  for (const { target, normalizedSynonyms } of candidates) {
    for (const synonym of normalizedSynonyms) {
      const distance = levenshtein(normalizedHeader, synonym);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestKey = target.key;
      }
    }
  }

  return bestDistance <= FUZZY_MAX_DISTANCE ? bestKey : '';
}

// Re-key each row from its original headers to canonical target keys, dropping any column that
// mapped to '' (ignored) or has no entry in `mapping` at all. Output keys are exactly the
// server's lowercase reserved keys / lowercased attribute names.
export function applyMapping(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
): Record<string, string>[] {
  return rows.map((row) => {
    const out: Record<string, string> = {};
    for (const [header, value] of Object.entries(row)) {
      const key = mapping[header];
      if (!key) continue;
      out[key] = value;
    }
    return out;
  });
}

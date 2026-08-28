// Deterministic (no-LLM, no-API-key) column-mapping suggester for the bulk product/image
// import wizard. Given the headers of an uploaded CSV/XLSX and the set of possible targets
// (reserved product fields + the company's taxonomy attributes), guess a header -> target
// mapping so the human only has to confirm/correct via dropdown rather than map every column
// from scratch. Canonical keys for reserved targets MUST match the server's lowercase
// `RESERVED` set in product-import.service.ts (handle, name, category, description, material,
// sku, price, originalprice, stock, moq, imageurl, images, visibility, ownercompanyid, hsn,
// gst) -- getting one wrong means the server silently treats that column as an attribute (or
// drops it), and OMITTING one (as hsn/gst were) means the wizard can't map it at all.

export interface MapTarget {
  key: string; // canonical row key ('' = ignore this column)
  label: string;
  synonyms: string[];
}

// Reserved product/variant fields the server import pipeline understands directly.
export const RESERVED_TARGETS: MapTarget[] = [
  // Displayed as "Product Group" (the shared code that groups a product's variant rows into one
  // product); 'handle' & 'slug' kept as synonyms so previously-made sheets still auto-map.
  { key: 'handle', label: 'Product Group', synonyms: ['product group', 'productgroup', 'product code', 'product id', 'group', 'handle', 'slug', 'url handle', 'product handle'] },
  { key: 'name', label: 'Name', synonyms: ['name', 'title', 'product name', 'product title', 'item', 'item name'] },
  { key: 'category', label: 'Category', synonyms: ['category', 'cat', 'type', 'product category'] },
  { key: 'description', label: 'Description', synonyms: ['description', 'desc', 'details', 'product description'] },
  { key: 'material', label: 'Material', synonyms: ['material', 'materials', 'made of'] },
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
  { key: 'hsn', label: 'HSN', synonyms: ['hsn', 'hsn code', 'hsncode', 'tariff', 'tariff code'] },
  { key: 'gst', label: 'GST', synonyms: ['gst', 'gst rate', 'gst%', 'gst percent', 'tax rate', 'gst slab'] },
];

// Extra synonyms for common taxonomy attribute names. Attribute names themselves come from the
// DB at runtime (buildTargets' argument), so this table only covers well-known ones; anything
// else still works via its own name/label (exact or fuzzy) with no extra synonyms.
// IMPORTANT: never add an entry here whose key duplicates a RESERVED_TARGETS key (e.g.
// 'material') -- buildTargets dedupes by key so it wouldn't create a second target, but a
// shared synonym (e.g. 'fabric') on both would still let two DISTINCT source columns (a real
// "Material" column and a real "Fabric" column) collide onto the same output key and silently
// overwrite one another in applyMapping. Reserved keys stay exclusively in RESERVED_TARGETS.
const ATTRIBUTE_SYNONYMS: Record<string, string[]> = {
  color: ['colour', 'colours', 'colors', 'col'],
  size: ['sizes', 'dimension', 'dimensions'],
  capacity: ['volume', 'vol'],
  weight: ['wt', 'mass'],
  finish: ['texture'],
  pattern: ['design', 'print'],
  style: ['variant', 'variant type'],
};

const IGNORE_TARGET: MapTarget = {
  key: '',
  label: 'Ignore',
  synonyms: ['ignore', 'skip', 'na', 'n a', 'do not import', 'none', 'blank'],
};

// Sentinel target: "keep this column as a brand-new attribute". Offered in the wizard dropdown so
// a seller/admin can carry an attribute the taxonomy doesn't have yet (e.g. "Fragrance"). unlike
// a reserved/existing-attribute target, applyMapping keeps the column keyed by its ORIGINAL
// header, so the server treats it as a free-text attribute named after that header (seller: goes
// onto the draft, created globally on admin approval; admin: auto-created via _createNeededTaxonomy).
// NEVER auto-suggested -- it's a deliberate manual choice, so suggestMapping excludes it below.
export const NEW_ATTRIBUTE_KEY = '__new_attribute__';
const NEW_ATTRIBUTE_TARGET: MapTarget = { key: NEW_ATTRIBUTE_KEY, label: 'New attribute (keep column name)', synonyms: [] };

// Build the full target list for a mapping session: reserved fields + one target per (active)
// taxonomy attribute + a trailing "ignore this column" option. Deduped by key: a taxonomy
// attribute whose lowercased name collides with a reserved key (or an earlier attribute) must
// NOT produce a second target with the same key -- two targets sharing a key is exactly what
// let two distinct source columns collide onto the same output key and silently overwrite one
// another in applyMapping. Any new synonyms are merged into the one surviving target instead.
export function buildTargets(attributeNames: string[]): MapTarget[] {
  // Clone RESERVED_TARGETS' objects (and their synonym arrays) so merging attribute synonyms
  // below never mutates the shared exported constant across calls.
  const targets: MapTarget[] = RESERVED_TARGETS.map((t) => ({ ...t, synonyms: [...t.synonyms] }));
  const byKey = new Map<string, MapTarget>(targets.map((t) => [t.key, t]));

  for (const name of attributeNames) {
    const key = name.toLowerCase();
    const extraSynonyms = ATTRIBUTE_SYNONYMS[normalize(name)] ?? [];
    const existing = byKey.get(key);
    if (existing) {
      existing.synonyms = Array.from(new Set([...existing.synonyms, ...extraSynonyms]));
      continue;
    }
    const target: MapTarget = { key, label: name, synonyms: extraSynonyms };
    targets.push(target);
    byKey.set(key, target);
  }

  targets.push(NEW_ATTRIBUTE_TARGET);
  targets.push(IGNORE_TARGET);
  return targets;
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
// Short tokens (e.g. 'cat', 'moq', 'qty') are cheap to accidentally land within
// FUZZY_MAX_DISTANCE of an unrelated short header (e.g. 'Car' is 1 edit from 'cat') -- a false
// positive. Below this length a synonym/label may only match exactly (the pass above), never
// fuzzily.
const MIN_FUZZY_TOKEN_LENGTH = 4;

// Suggest a header -> target.key mapping. Deterministic, no network/LLM call: normalize each
// header, try an exact match against every target's normalized label/key/synonyms first, then
// fall back to the closest match within FUZZY_MAX_DISTANCE. Anything left over maps to ''
// (ignore) -- the human confirms/corrects the whole table via dropdown downstream, so this only
// needs to save clicks, not be perfect.
export function suggestMapping(headers: string[], targets: MapTarget[]): Record<string, string> {
  // Exclude the "new attribute" sentinel — it must be a deliberate manual pick, never auto-suggested.
  const candidates = targets.filter((t) => t.key !== NEW_ATTRIBUTE_KEY).map((target) => {
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
      if (synonym.length < MIN_FUZZY_TOKEN_LENGTH) continue; // exact-only below this length
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
      // "New attribute": keep the column keyed by its own header so the server treats it as a
      // brand-new (free-text) attribute rather than a known field.
      if (key === NEW_ATTRIBUTE_KEY) { out[header.trim()] = value; continue; }
      out[key] = value;
    }
    return out;
  });
}

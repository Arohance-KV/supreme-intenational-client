import { RESERVED_TARGETS, buildTargets, suggestMapping, applyMapping } from './importMapping';

const targets = buildTargets(['Color', 'Size']);

describe('RESERVED_TARGETS', () => {
  it('has lowercase canonical keys matching the server RESERVED set', () => {
    const keys = RESERVED_TARGETS.map((t) => t.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        'handle', 'name', 'category', 'description', 'material', 'sku', 'price',
        'originalprice', 'stock', 'moq', 'imageurl', 'images', 'visibility', 'ownercompanyid',
      ]),
    );
    // every key already lowercase
    expect(keys.every((k) => k === k.toLowerCase())).toBe(true);
  });
});

describe('buildTargets', () => {
  it('adds one target per attribute (lowercased key) plus an ignore target', () => {
    const keys = targets.map((t) => t.key);
    expect(keys).toEqual(expect.arrayContaining(['color', 'size', '']));
  });

  it('does not create a duplicate target when an attribute name collides with a reserved key', () => {
    const t = buildTargets(['Material', 'Color', 'Size']);
    const materialTargets = t.filter((x) => x.key === 'material');
    expect(materialTargets).toHaveLength(1);
  });
});

describe('suggestMapping', () => {
  it('maps synonyms and fuzzy near-misses to canonical keys', () => {
    const m = suggestMapping(['Product Title', 'Colour', 'MRP', 'SKU Code', 'Weird'], targets);
    expect(m['Product Title']).toBe('name');
    expect(m['Colour']).toBe('color');
    expect(m['MRP']).toBe('price');
    expect(m['SKU Code']).toBe('sku');
    expect(m['Weird']).toBe(''); // no confident match -> ignore
  });

  it('resolves exact reserved-field headers', () => {
    const m = suggestMapping(['Handle', 'Name', 'Category', 'Description', 'Stock', 'MOQ', 'Visibility'], targets);
    expect(m['Handle']).toBe('handle');
    expect(m['Name']).toBe('name');
    expect(m['Category']).toBe('category');
    expect(m['Description']).toBe('description');
    expect(m['Stock']).toBe('stock');
    expect(m['MOQ']).toBe('moq');
    expect(m['Visibility']).toBe('visibility');
  });

  it('is case- and punctuation-insensitive, and tolerates small typos', () => {
    const m = suggestMapping(['sku-code', 'IMAGE URL', 'Pricee'], targets);
    expect(m['sku-code']).toBe('sku');
    expect(m['IMAGE URL']).toBe('imageurl');
    expect(m['Pricee']).toBe('price'); // 1-char typo, within the fuzzy-match budget
  });
});

describe('applyMapping', () => {
  it('re-keys rows to canonical keys and drops ignored columns', () => {
    const out = applyMapping(
      [{ 'Product Title': 'Pen', Colour: 'Black', Weird: 'x' }],
      suggestMapping(['Product Title', 'Colour', 'Weird'], targets),
    );
    expect(out).toEqual([{ name: 'Pen', color: 'Black' }]);
  });

  it('handles multiple rows independently', () => {
    const mapping = suggestMapping(['Name', 'Colour'], targets);
    const out = applyMapping(
      [
        { Name: 'Pen', Colour: 'Blue' },
        { Name: 'Mug', Colour: 'Red' },
      ],
      mapping,
    );
    expect(out).toEqual([
      { name: 'Pen', color: 'Blue' },
      { name: 'Mug', color: 'Red' },
    ]);
  });

  it('drops a header that has no entry in the mapping at all', () => {
    const out = applyMapping([{ Name: 'Pen', Unmapped: 'x' }], { Name: 'name' });
    expect(out).toEqual([{ name: 'Pen' }]);
  });

  it('does not silently collapse Material and Fabric columns onto the same key (data-loss regression)', () => {
    const t = buildTargets(['Material', 'Color']);
    const mapping = suggestMapping(['Material', 'Fabric', 'Color'], t);
    expect(mapping['Material']).toBe('material');
    // Fabric must never win the SAME non-empty key as Material -- either it gets a distinct
    // key or it's left unmapped ('') for the human to assign; silently merging is the bug.
    expect(mapping['Fabric'] === '' || mapping['Fabric'] !== mapping['Material']).toBe(true);

    const rows = applyMapping([{ Material: 'Cotton', Fabric: 'Linen', Color: 'Red' }], mapping);
    expect(rows[0].material).toBe('Cotton'); // Material's own value must survive
  });
});

describe('suggestMapping - short-synonym false positives', () => {
  it('does not fuzzy-match an unrelated short header to an unrelated short synonym', () => {
    // 'Car' is edit-distance 1 from the 3-char 'cat' synonym (Category) -- a real false
    // positive under a naive Levenshtein<=2 fuzzy pass over ALL synonym lengths. Short
    // tokens (<4 normalized chars) must require an exact match, not fuzzy, to be eligible.
    const m = suggestMapping(['Car'], targets);
    expect(m['Car']).toBe('');
  });
});

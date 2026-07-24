import { uploadFolderWith } from './bulkImport';

describe('uploadFolderWith', () => {
  it('uploads with bounded concurrency, reports progress, collects failures', async () => {
    const files = Array.from({ length: 5 }, (_, i) => new File(['x'], `f${i}.jpg`));
    let inFlight = 0;
    let maxInFlight = 0;
    const fakeUpload = async (f: File) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      inFlight--;
      if (f.name === 'f3.jpg') throw new Error('boom');
      return `url/${f.name}`;
    };
    const progress: number[] = [];
    const res = await uploadFolderWith(files, fakeUpload, (d) => progress.push(d), 2);

    expect(maxInFlight).toBeLessThanOrEqual(2);
    expect(res.failed).toEqual(['f3.jpg']);
    expect(res.map).toHaveLength(4);
    expect(progress[progress.length - 1]).toBe(5);
  });

  it('never exceeds the concurrency cap under slower/uneven task durations', async () => {
    // A naive `files.map(uploader)` + Promise.all would never violate this either (all start
    // at once, so maxInFlight === files.length) -- this is exactly the case a bounded worker
    // pool must catch that a naive implementation would not: more files than the cap, with
    // staggered completion times so slots free up and get reused mid-run.
    const files = Array.from({ length: 10 }, (_, i) => new File(['x'], `g${i}.jpg`));
    let inFlight = 0;
    let maxInFlight = 0;
    const durations = [30, 5, 20, 5, 25, 5, 15, 5, 10, 5];
    const fakeUpload = async (f: File, idx: number) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, durations[idx % durations.length]));
      inFlight--;
      return `url/${f.name}`;
    };
    let i = 0;
    const uploader = (f: File) => fakeUpload(f, i++);
    const res = await uploadFolderWith(files, uploader, () => {}, 3);

    expect(maxInFlight).toBeLessThanOrEqual(3);
    expect(res.map).toHaveLength(10);
    expect(res.failed).toEqual([]);
  });

  it('fires progress exactly once per file, in completion order, ending at total', async () => {
    const files = Array.from({ length: 4 }, (_, i) => new File(['x'], `h${i}.jpg`));
    const progress: number[] = [];
    const res = await uploadFolderWith(
      files,
      async (f) => `url/${f.name}`,
      (done) => progress.push(done),
      2,
    );
    expect(progress).toEqual([1, 2, 3, 4]);
    expect(res.map.map((m) => m.filename).sort()).toEqual(['h0.jpg', 'h1.jpg', 'h2.jpg', 'h3.jpg']);
  });

  it('returns an empty result for an empty file list without calling the uploader', async () => {
    const uploader = jest.fn();
    const progress: number[] = [];
    const res = await uploadFolderWith([], uploader, (d) => progress.push(d), 2);
    expect(uploader).not.toHaveBeenCalled();
    expect(res).toEqual({ map: [], failed: [] });
    expect(progress).toEqual([]);
  });
});

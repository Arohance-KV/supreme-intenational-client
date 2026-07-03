import { getSessionId } from './session';

// L9: the guest session id underpins the guest cart — verify it's generated, persisted,
// stable across calls, and regenerated when a stored value is too short to be valid.
describe('getSessionId', () => {
  beforeEach(() => localStorage.clear());

  it('generates and persists a 24-char id when none exists', () => {
    const id = getSessionId();
    expect(id).toHaveLength(24);
    expect(localStorage.getItem('x-session-id')).toBe(id);
  });

  it('reuses the same id across calls', () => {
    const id = getSessionId();
    expect(getSessionId()).toBe(id);
  });

  it('regenerates when the stored id is too short', () => {
    localStorage.setItem('x-session-id', 'short');
    const id = getSessionId();
    expect(id).toHaveLength(24);
    expect(id).not.toBe('short');
  });
});

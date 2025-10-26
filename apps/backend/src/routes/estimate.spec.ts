import { describe, expect, it } from 'vitest';

import { scoreMatch } from './estimate.js';

describe('scoreMatch', () => {
  it('scores based on overlapping tokens', () => {
    const score = scoreMatch('устройство цементно-песчаной стяжки пола', 'стяжка пола 60 м2');
    expect(score).toBeGreaterThan(0);
  });

  it('returns zero when there is no overlap', () => {
    const score = scoreMatch('монтаж электроустановочных изделий', 'покраска фасада');
    expect(score).toBe(0);
  });
});

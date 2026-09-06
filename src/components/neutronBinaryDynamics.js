// Scaled, leading-order circular inspiral: a^4 decreases linearly and
// orbital angular velocity scales as a^(-3/2). Time/length are display units.
// Background: https://ligo.org/science-summaries/gw170817bns/
// The contact transition and remnant are illustrative, not numerical relativity.
export const MERGER_TIME = 42;
export const END_TIME = 54;
const START = 3.4;
const CONTACT = 0.62;
const RATE = (START ** 4 - CONTACT ** 4) / MERGER_TIME;

export function binaryState(time) {
  const t = Math.min(time, MERGER_TIME);
  const radius = (START ** 4 - RATE * t) ** 0.25;
  const phase = 0.4 + (0.62 * START ** 1.5 * 8 / (5 * RATE)) *
    (START ** 2.5 - radius ** 2.5);
  return { radius, phase, progress: Math.max(0, t / MERGER_TIME) };
}

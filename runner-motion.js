'use strict';

const RunnerMotion = {
  viewDistance: 140,
  playerDepth: 7,
  speed(distance) {
    return Math.min(70, 44 + distance / 110);
  },
  bend(distance) {
    return .34 * Math.sin(distance / 125) + .12 * Math.sin(distance / 65);
  },
  // Recycle each object only after it passes the camera, never every spacing interval.
  sceneryDepth(index, distance, spacing = 14, count = 14) {
    const length = spacing * count;
    return ((index * spacing - distance + 16) % length + length) % length - 16;
  },
  project(lane, depth, width, height, bend) {
    const t = Math.pow(Math.max(0, 1 - depth / this.viewDistance), 2);
    const playerT = Math.pow(1 - this.playerDepth / this.viewDistance, 2);
    const curve = width * bend * (Math.pow(1 - t, 2) - Math.pow(1 - playerT, 2));
    return {
      x: width / 2 + curve + (lane - 1) * width * (.063 + .32 * t),
      y: height * (.205 + .755 * t),
      s: .12 + .88 * t,
      t
    };
  }
};

if (typeof module !== 'undefined') module.exports = RunnerMotion;

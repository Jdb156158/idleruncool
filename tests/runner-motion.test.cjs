const test = require('node:test');
const assert = require('node:assert/strict');
const motion = require('../runner-motion.js');

test('starts at 44 m/s, accelerates, and caps at 70 m/s', () => {
  assert.equal(motion.speed(0), 44);
  assert.ok(motion.speed(700) > 50);
  assert.equal(motion.speed(5000), 70);
  assert.ok((motion.viewDistance - motion.playerDepth) / motion.speed(5000) > 1.8);
});

test('buildings keep moving forward across the old short-loop reset boundaries', () => {
  for (let distance = 0; distance < 1200; distance += .3) {
    for (let i = 0; i < 14; i++) {
      const before = motion.sceneryDepth(i, distance);
      const after = motion.sceneryDepth(i, distance + .3);
      if (after > before) {
        assert.ok(before < -15.69, 'only recycle behind the camera');
        assert.ok(after > motion.viewDistance, 're-enter beyond the horizon');
      } else {
        assert.ok(Math.abs(before - after - .3) < 1e-9);
      }
    }
  }
});

test('nearby scenery and obstacles cover the same distance at every frame rate', () => {
  for (const fps of [30, 60, 120]) {
    let distance = 0;
    let obstacle = 100;
    const initial = motion.sceneryDepth(7, 0);
    for (let i = 0; i < fps; i++) {
      const travel = motion.speed(distance) / fps;
      distance += travel;
      obstacle -= travel;
    }
    assert.ok(Math.abs(initial - motion.sceneryDepth(7, distance) - (100 - obstacle)) < 1e-9);
  }
});

test('curves go both ways while keeping the player position anchored', () => {
  const bends = [];
  for (let distance = 0; distance < 2000; distance += 5) {
    const bend = motion.bend(distance);
    bends.push(bend);
    const point = motion.project(1, motion.playerDepth, 390, 844, bend);
    assert.equal(point.x, 195);
    assert.ok(Math.abs(motion.bend(distance + 1) - bend) < .005);
  }
  assert.ok(Math.max(...bends) > .3);
  assert.ok(Math.min(...bends) < -.3);
});

test('all lane objects follow the curved road with unchanged lane spacing', () => {
  for (const depth of [0, 7, 40, 90, 140]) {
    const straight = [0, 1, 2].map(lane => motion.project(lane, depth, 390, 844, 0));
    const curved = [0, 1, 2].map(lane => motion.project(lane, depth, 390, 844, .4));
    for (let lane = 0; lane < 3; lane++) {
      assert.equal(curved[lane].y, straight[lane].y);
      assert.ok(Math.abs(curved[lane].x - straight[lane].x - (curved[1].x - straight[1].x)) < 1e-9);
    }
  }
});

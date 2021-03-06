/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {readFileSync} from 'fs';
import {createRequire} from 'module';
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import staticImportedStateful from '../stateful.mjs';
import staticImportedStatefulFromCjs from '../fromCjs.mjs';
import {double} from '../index';

test('should have correct import.meta', () => {
  expect(typeof require).toBe('undefined');
  expect(typeof jest).toBe('undefined');
  expect(import.meta).toEqual({
    url: expect.any(String),
  });
  expect(
    import.meta.url.endsWith('/e2e/native-esm/__tests__/native-esm.test.js')
  ).toBe(true);
});

test('should double stuff', () => {
  expect(double(1)).toBe(2);
});

test('should support importing node core modules', () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = resolve(dir, '../package.json');

  expect(JSON.parse(readFileSync(packageJsonPath, 'utf8'))).toEqual({
    jest: {
      testEnvironment: 'node',
      transform: {},
    },
    type: 'module',
  });
});

test('dynamic import should work', async () => {
  const {double: importedDouble} = await import('../index');

  expect(importedDouble).toBe(double);
  expect(importedDouble(1)).toBe(2);
});

test('import cjs', async () => {
  const {default: half} = await import('../commonjs.cjs');

  expect(half(4)).toBe(2);
});

test('require(cjs) and import(cjs) should share caches', async () => {
  const require = createRequire(import.meta.url);

  const {default: importedStateful} = await import('../stateful.cjs');
  const requiredStateful = require('../stateful.cjs');

  expect(importedStateful()).toBe(1);
  expect(importedStateful()).toBe(2);
  expect(requiredStateful()).toBe(3);
  expect(importedStateful()).toBe(4);
  expect(requiredStateful()).toBe(5);
  expect(requiredStateful()).toBe(6);
});

test('import from mjs and import(mjs) should share caches', async () => {
  const {default: importedStateful} = await import('../stateful.mjs');

  expect(importedStateful()).toBe(1);
  expect(importedStateful()).toBe(2);
  expect(staticImportedStateful()).toBe(3);
  expect(importedStateful()).toBe(4);
  expect(staticImportedStateful()).toBe(5);
  expect(staticImportedStateful()).toBe(6);
});

test('import cjs via import statement', () => {
  expect(staticImportedStatefulFromCjs(4)).toBe(2);
});

test('handle unlinked dynamic imports', async () => {
  const {double: deepDouble} = await import('../dynamicImport');

  expect(deepDouble).toBe(double);

  expect(deepDouble(4)).toBe(8);
});

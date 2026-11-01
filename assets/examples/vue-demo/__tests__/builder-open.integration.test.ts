import { describe, expect, it } from 'vitest';
import { UgosViteBuilder } from '@ugreen-nas/builder-open';

/**
 * 校验应用在 Vite 8 下能正确实例化开源构建器并注册核心插件。
 * @returns 无（断言由 Vitest 收集）
 */
function assertBuilderPluginsExposeUgosCore(): void {
  const builder = new UgosViteBuilder({
    windowConfig: { width: 800, height: 600 },
    getIgnoreFolder: (c: unknown) => c,
  });
  const plugins = builder.pluginEntry() as { name?: string }[];
  expect(plugins.some(p => p.name === 'ugos-vite-builder')).toBe(true);
}

describe('@ugreen-nas/builder-open', () => {
  it('pluginEntry 包含 ugos-vite-builder 插件', () => {
    assertBuilderPluginsExposeUgosCore();
  });
});

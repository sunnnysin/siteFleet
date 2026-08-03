import ReactTestRenderer, {
  type ReactTestRenderer as Renderer,
} from 'react-test-renderer';
import type { ReactElement } from 'react';

export function createNavigationMock(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn((event: string, callback: () => void) => {
      if (event === 'focus') {
        callback();
      }
      return () => {};
    }),
    ...overrides,
  };
}

export function createRouteMock(
  params: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    key: 'test-route',
    name: 'Test',
    params,
  };
}

export async function renderScreen(element: ReactElement): Promise<Renderer> {
  let renderer: Renderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(element);
    await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
  });
  return renderer as Renderer;
}

export function treeContainsText(renderer: Renderer, text: string): boolean {
  return JSON.stringify(renderer.toJSON()).includes(text);
}

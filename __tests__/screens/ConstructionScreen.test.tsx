import { ConstructionScreen } from '@/screens/ConstructionScreen';
import { renderScreen, treeContainsText } from './testUtils';

describe('ConstructionScreen', () => {
  it('renders the coming-soon placeholder', async () => {
    const renderer = await renderScreen(<ConstructionScreen />);

    expect(treeContainsText(renderer, 'Coming soon')).toBe(true);
  });
});

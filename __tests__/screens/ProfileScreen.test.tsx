import { ProfileScreen } from '@/screens/ProfileScreen';
import { renderScreen, treeContainsText } from './testUtils';

describe('ProfileScreen', () => {
  it('renders the sign-out action', async () => {
    const renderer = await renderScreen(<ProfileScreen />);

    expect(treeContainsText(renderer, 'Sign out')).toBe(true);
  });
});

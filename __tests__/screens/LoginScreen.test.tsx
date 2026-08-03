import { LoginScreen } from '@/screens/LoginScreen';
import { renderScreen, treeContainsText } from './testUtils';

describe('LoginScreen', () => {
  it('renders the app name and sign-in button', async () => {
    const renderer = await renderScreen(<LoginScreen />);

    expect(treeContainsText(renderer, 'SiteFleet')).toBe(true);
  });
});

/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { enableFreeze } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

enableFreeze(false);

AppRegistry.registerComponent(appName, () => App);

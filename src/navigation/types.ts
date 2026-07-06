export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Transport: undefined;
  Construction: undefined;
  Profile: undefined;
};

export type TransportStackParamList = {
  Dashboard: undefined;
  DriverList: undefined;
  AddEditDriver: { driverId?: string };
  RouteList: undefined;
  AddEditRoute: { routeId?: string };
  FuelPrice: undefined;
  DailyAssignment: undefined;
  DailyEntryList: undefined;
  MonthlyPayment: undefined;
};

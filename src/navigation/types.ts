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
  DriverDetail: { driverId: string };
  AddEditDriver: { driverId?: string };
  RouteList: undefined;
  AddEditRoute: { routeId?: string };
  FuelPrice: undefined;
  DailyEntryList: undefined;
  AddEditDailyEntry: { date: string; driverId?: string };
  MonthlyPayment: undefined;
};

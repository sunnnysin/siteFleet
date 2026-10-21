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
  AddDriverAdvance: { driverId: string };
  AddDriverPayment: { driverId: string };
  RouteList: undefined;
  AddEditRoute: { routeId?: string };
  FuelPrice: undefined;
  Pump: undefined;
  DieselDistribution: undefined;
  DailyEntryList: undefined;
  AddEditDailyEntry: { date: string; driverId?: string };
  MonthlyPayment: undefined;
  DriverPaymentDetails: undefined;
  Summary: undefined;
  Bill: undefined;
  GoraulSummary: undefined;
  GoraulBill: undefined;
  MySummary: undefined;
};

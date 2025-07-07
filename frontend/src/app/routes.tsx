import { RCAConsole } from '@/components/scheduler/RCAConsole';

// ... existing imports and routes ...

export const routes = [
  // ... existing routes ...
  {
    path: '/rca-console/:incidentId',
    element: <RCAConsole />
  }
]; 
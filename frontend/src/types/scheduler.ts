// Define types for the scheduler components
export interface ScheduledTest {
  id: string;
  name: string;
  instruction: string;
  schedule: string;
  lastRun: string;
  status: 'passed' | 'failed' | 'pending';
  incidentId?: string;
  date?: Date;
  environments: string[];
  agent: string;
}

export interface TestResult {
  id: string;
  testName: string;
  runDate: string;
  status: string;
  details: string;
  incidentId?: string;
  agent: string;
  environment: string;
  history?: TestRunHistory[];
}

export interface TestFormValues {
  title: string;
  instruction: string;
  date: Date;
  time: string;
  frequency: string;
  agents: string[];
  environments: string[];
  expectedBehavior?: string;
}

export interface TestRunHistory {
  id: string;
  timestamp: string;
  agentVersion: string;
  status: string;
  promptBefore: string;
  promptAfter: string;
  settingsBefore?: Record<string, string>;
  settingsAfter?: Record<string, string>;
} 
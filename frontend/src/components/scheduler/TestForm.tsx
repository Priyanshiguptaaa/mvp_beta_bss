import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Simplified list of AI agents
const aiAgents = [
  'Finance Agent',
  'Customer Support Agent',
  'Sales Assistant',
  'Recommendation Engine',
  'Scoring Agent'
];

// Simplified environments
const environments = [
  'Development',
  'Production'
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  instruction: z.string().min(10, "Natural language instruction needs to be detailed"),
  date: z.date(),
  time: z.string().min(1, "Time is required"),
  frequency: z.string(),
  agents: z.array(z.string()).min(1, "Select at least one agent"),
  environments: z.array(z.string()).min(1, "Select at least one environment"),
  expectedBehavior: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TestFormProps {
  onSubmit: (values: FormValues) => void;
  initialDate?: Date;
}

export function TestForm({ onSubmit, initialDate }: TestFormProps) {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(['Development']);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      instruction: '',
      date: initialDate || new Date(),
      time: '09:00',
      frequency: 'daily',
      agents: [],
      environments: ['Development'],
      expectedBehavior: '',
    }
  });
  
  const handleSubmit = (values: FormValues) => {
    onSubmit({
      ...values,
      agents: selectedAgents,
      environments: selectedEnvironments,
    });
  };
  
  const handleAgentToggle = (agent: string) => {
    setSelectedAgents(prev => 
      prev.includes(agent)
        ? prev.filter(a => a !== agent)
        : [...prev, agent]
    );
  };

  const handleEnvironmentToggle = (env: string) => {
    setSelectedEnvironments(prev => 
      prev.includes(env)
        ? prev.filter(e => e !== env)
        : [...prev, env]
    );
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Finance Agent Tool Usage Test" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="instruction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Natural Language Instruction</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="E.g., Check if Finance Agent calls calculator tool when invoice calculation is mentioned" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Time</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type="time" 
                      placeholder="Select time" 
                      {...field} 
                    />
                  </FormControl>
                  <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Run Frequency</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="How often to run?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="once">Run Once</SelectItem>
                  <SelectItem value="daily">Once Daily</SelectItem>
                  <SelectItem value="weekly">Once Weekly</SelectItem>
                  <SelectItem value="on-deployment">On Deployment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>AI Agents to Test</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {aiAgents.map((agent) => (
              <Button
                key={agent}
                type="button"
                variant={selectedAgents.includes(agent) ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-xs",
                  selectedAgents.includes(agent) 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : ""
                )}
                onClick={() => handleAgentToggle(agent)}
              >
                {agent}
              </Button>
            ))}
          </div>
          {selectedAgents.length === 0 && (
            <p className="text-sm text-red-500 mt-2">
              Select at least one agent
            </p>
          )}
        </FormItem>
        
        <FormItem>
          <FormLabel>Test Environments</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {environments.map((env) => (
              <Button
                key={env}
                type="button"
                variant={selectedEnvironments.includes(env) ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-xs",
                  selectedEnvironments.includes(env) 
                    ? "bg-green-600 hover:bg-green-700" 
                    : ""
                )}
                onClick={() => handleEnvironmentToggle(env)}
              >
                {env}
              </Button>
            ))}
          </div>
          {selectedEnvironments.length === 0 && (
            <p className="text-sm text-red-500 mt-2">
              Select at least one environment
            </p>
          )}
        </FormItem>
        
        <FormField
          control={form.control}
          name="expectedBehavior"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Behavior (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What behavior constitutes a successful test? (Optional)" 
                  rows={2}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button 
            type="submit"
            disabled={selectedAgents.length === 0 || selectedEnvironments.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Schedule Test
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-white shadow-lg rounded-xl p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-purple-800 font-bold">Create New Test</CardTitle>
          <CardDescription>Fill out the details to schedule a new test</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {formContent}
        </CardContent>
      </Card>
    </div>
  );
} 
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:8000/api/scheduler/test-results', {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching to always get fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch test results: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the data to match the frontend's expected format
    const transformedData = data.map((result: any) => ({
      id: result.id.toString(),
      testName: result.testName,
      runDate: result.runDate,
      status: result.status,
      details: result.details || '',
      incidentId: result.incidentId,
      agent: result.agent,
      environment: result.environment,
      history: result.history || []
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test results' },
      { status: 500 }
    );
  }
} 
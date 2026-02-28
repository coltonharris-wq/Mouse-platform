import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, amount, description, referenceId, referenceType } = body;

    if (!customerId || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend to use AI Work Hours
    const response = await fetch(
      `${API_BASE_URL}/api/v1/customers/${customerId}/tokens/use`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          description,
          reference_id: referenceId,
          reference_type: referenceType
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to use AI Work Hours' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Work Hours usage error:', error);
    return NextResponse.json(
      { error: 'Failed to use AI Work Hours' },
      { status: 500 }
    );
  }
}

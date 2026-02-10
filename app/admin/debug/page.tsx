import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import ClearDbButton from './clear-db-button';

export default async function DebugPage() {
  const user = await verifyAuth();
  if (!user) redirect('/admin/login');
  let dbStatus = 'Disconnected';
  let dbError = null;
  let collections: string[] = [];
  let apiTests: any = {};

  try {
    await dbConnect();
    dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    if (mongoose.connection.readyState === 1) {
      const colls = await mongoose.connection.db.listCollections().toArray();
      collections = colls.map(c => c.name);
    }
  } catch (error: any) {
    dbError = error.message;
  }

  // Test API endpoints
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const endpoints = [
      '/api/articles',
      '/api/news',
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(`${baseUrl}${endpoint}`, { cache: 'no-store' });
        apiTests[endpoint] = {
          status: res.status,
          ok: res.ok,
        };
      } catch (err: any) {
        apiTests[endpoint] = {
          status: 'Error',
          error: err.message,
        };
      }
    }
  } catch (err) {
    // Skip API tests if not available
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>MongoDB Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Status: </span>
                <span className={dbStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}>
                  {dbStatus}
                </span>
              </p>
              {dbError && (
                <p className="text-red-600">
                  <span className="font-semibold">Error: </span>
                  {dbError}
                </p>
              )}
              <p>
                <span className="font-semibold">Connection String: </span>
                {process.env.MOGODB_CONNECTION ? 'Configured' : 'Missing'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Collections</CardTitle>
          </CardHeader>
          <CardContent>
            {collections.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {collections.map(col => (
                  <li key={col}>{col}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No collections found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoints Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.keys(apiTests).length > 0 ? (
                Object.entries(apiTests).map(([endpoint, data]: [string, any]) => (
                  <div key={endpoint} className="flex justify-between items-center">
                    <span className="font-mono text-sm">{endpoint}</span>
                    <span className={data.ok ? 'text-green-600' : 'text-red-600'}>
                      {data.status} {data.error && `(${data.error})`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">API tests not available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p>MOGODB_CONNECTION: {process.env.MOGODB_CONNECTION ? '✓ Set' : '✗ Missing'}</p>
              <p>JWT_SECRET: {process.env.JWT_SECRET ? '✓ Set' : '✗ Missing'}</p>
              <p>GEMINI_API_KEY: {process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Missing'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Clear all collections from the database. This action cannot be undone.
            </p>
            <ClearDbButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

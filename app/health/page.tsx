"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { nhlApi } from "../../lib/api";

// Define the HealthResponse type based on the new API format
export type HealthResponse = {
  status: string;
  service: string;
  async: boolean;
  database: string;
  active_tasks: number;
  system: {
    cpu_percent: number;
    memory_percent: number;
    timestamp: number;
  };
};

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        // Fetch the health data from API
        const data: HealthResponse = await nhlApi.healthCheck(); // nhlApi.healthCheck should already return parsed JSON
        setHealthData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        No health data available
      </div>
    );
  }

  const formatTimestamp = (ts: number) => new Date(ts * 1000).toLocaleString();

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">System Health</h1>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                healthData.status === "healthy" ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-600">
              {healthData.status === "healthy" ? "Operational" : "Degraded"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900">Service</h3>
            <p className="text-sm text-gray-600 mt-1">{healthData.service}</p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium ${
                healthData.status === "healthy"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {healthData.status}
            </span>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900">Database</h3>
            <p className="text-sm text-gray-600 mt-1">{healthData.database}</p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium ${
                healthData.database === "healthy"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {healthData.database}
            </span>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900">Active Tasks</h3>
            <p className="text-sm text-gray-600 mt-1">{healthData.active_tasks}</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900">Async Mode</h3>
            <p className="text-sm text-gray-600 mt-1">
              {healthData.async ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>
      </div>

      {/* System Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">CPU Usage</span>
              <span className="text-sm font-medium text-gray-700">
                {healthData.system.cpu_percent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${healthData.system.cpu_percent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Memory Usage</span>
              <span className="text-sm font-medium text-gray-700">
                {healthData.system.memory_percent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${healthData.system.memory_percent}%` }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Last Update</h3>
            <p className="text-sm text-gray-600">{formatTimestamp(healthData.system.timestamp)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

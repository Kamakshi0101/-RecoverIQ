import React from 'react';

export default function ErrorAlert({ message }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{message || "An unexpected error occurred. Please try again."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

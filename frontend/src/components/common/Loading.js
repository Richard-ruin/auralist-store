// components/common/Loading.js
import React from 'react';

const Loading = ({ variant = 'spinner', text = 'Loading...' }) => {
  const renderSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200"></div>
        {/* Inner spinning ring */}
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <span className="ml-3 text-lg font-medium text-gray-700">{text}</span>
    </div>
  );

  const renderPulse = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
      <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse delay-75"></div>
      <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse delay-150"></div>
    </div>
  );

  const renderSkeleton = () => (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
          {/* Image placeholder */}
          <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
          <div className="p-4 space-y-3">
            {/* Title placeholder */}
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            {/* Description placeholder */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            {/* Button placeholder */}
            <div className="h-8 bg-gray-200 rounded mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <span className="ml-3 text-gray-700">{text}</span>
      </div>
    </div>
  );

  const variants = {
    spinner: renderSpinner,
    pulse: renderPulse,
    skeleton: renderSkeleton,
    cards: renderCards,
    overlay: renderOverlay,
  };

  const LoadingComponent = variants[variant] || variants.spinner;

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingComponent />
    </div>
  );
};

// Wrapper component for full page loading
export const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading variant="spinner" text="Loading page..." />
  </div>
);

// Wrapper component for section loading
export const SectionLoading = ({ height = 'min-h-[400px]' }) => (
  <div className={`${height} flex items-center justify-center`}>
    <Loading variant="spinner" />
  </div>
);

// Wrapper component for card loading
export const CardLoading = () => (
  <Loading variant="cards" />
);

export default Loading;
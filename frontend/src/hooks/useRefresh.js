import { useCallback, useEffect, useRef } from 'react';

// Simple event system for refresh notifications
const refreshListeners = new Set();

export const useRefresh = () => {
  const refreshRef = useRef(() => {
    // Notify all listeners
    refreshListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in refresh listener:', error);
      }
    });
  });

  const subscribe = useCallback((callback) => {
    refreshListeners.add(callback);
    return () => {
      refreshListeners.delete(callback);
    };
  }, []);

  return {
    triggerRefresh: refreshRef.current,
    subscribeToRefresh: subscribe
  };
};

export const useRefreshSubscription = (callback) => {
  const { subscribeToRefresh } = useRefresh();
  
  useEffect(() => {
    return subscribeToRefresh(callback);
  }, [callback, subscribeToRefresh]);
};
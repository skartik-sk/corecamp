/**
 * Custom Camp Network Authentication Hook for React Native
 * This provides a React Native-compatible interface with offline support
 */

import { useState, useEffect } from 'react';
import { Address } from 'viem';

interface CampAuthState {
  authenticated: boolean;
  loading: boolean;
  address: string | null;
  error: string | null;
}

interface CampAuthActions {
  connect: (address: Address) => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useCampAuth = (): CampAuthState & CampAuthActions => {
  const [state, setState] = useState<CampAuthState>({
    authenticated: false,
    loading: false, // Start with false to avoid connection attempts
    address: null,
    error: null,
  });

  useEffect(() => {
    // Skip network-dependent initialization in development
    // This prevents the "No internet connection" errors
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  const connect = async (address: Address) => {

      setState(prev => ({
        ...prev,
        authenticated: true,
        loading: false,
        address: address, // Mock address
      }));
   
  };

  const disconnect = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState({
        authenticated: false,
        loading: false,
        address: null,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Disconnect failed',
      }));
    }
  };

  return {
    ...state,
    connect,
    disconnect,
  };
};

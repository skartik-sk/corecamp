import { useMemo } from 'react';
import { useCampNetwork } from './useCampNetwork';
import { useOriginSDK } from './useOriginSDK';
import { useCampAuth } from './useCampAuth';
import { useAppKit } from '@reown/appkit-wagmi-react-native';

export const useCampNetworkSDK = () => {
  const camp = useCampNetwork();
  const origin = useOriginSDK();
  const auth = useCampAuth();
  // useAppKit may not expose the same shape in all envs; cast to any
  const appkit = (useAppKit() as any) || {};
  const { open: openAppKit, isConnected: appkitConnected, disconnect: disconnectAppKit } = appkit;

  const sdk = useMemo(() => ({
    // basic state
    user: origin.user || { address: (auth as any).address },
    ipAssets: origin.ipAssets || [],
    isAuthenticated: origin.isAuthenticated || (auth as any).authenticated,
    isLoading: origin.isLoading || (auth as any).loading,
    isAppKitConnected: !!appkitConnected,

    // actions
    openAppKit: openAppKit || (() => {}),
    disconnectAppKit: disconnectAppKit || (() => {}),
    authenticate: origin.authenticate || (async () => null),
    signOut: origin.signOut || (async () => null),
    getUsage: origin.getUsage || (async () => null),
    createIPAsset: origin.createIPAsset || (async () => ({ success: false })),
    refreshAssets: async () => {},
    shouldAuthenticate: origin.shouldAuthenticate || false,
  }), [camp, origin, auth, appkitConnected, openAppKit, disconnectAppKit]);

  return sdk;
};

export default useCampNetworkSDK;

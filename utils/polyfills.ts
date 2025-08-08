// Prevent multiple WalletConnect Core initializations
// @ts-ignore
if (typeof global.__WC_CORE_INIT_GUARD__ === 'undefined') {
  // @ts-ignore
  global.__WC_CORE_INIT_GUARD__ = true;
  
  // Override console methods to suppress duplicate init warnings during development
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('WalletConnect Core is already initialized') ||
        message.includes('Init() was called')) {
      // Suppress these warnings as we handle them with our guard
      return;
    }
    originalWarn.apply(console, args);
  };
}

/**
 * React Native Polyfills for Camp Network Origin SDK
 * This file provides browser API polyfills needed for the Origin SDK to work in React Native
 */

// @ts-ignore
if (typeof global.window === 'undefined') {
  // @ts-ignore
  global.window = global;
}

// Add window.open polyfill for React Native - MUST BE EARLY
// @ts-ignore
if (global.window && !global.window.open) {
  console.log('🔧 Adding window.open polyfill...');
  // @ts-ignore
  global.window.open = function(url, target, features) {
    console.log('🔧 window.open polyfill called with URL:', url);
    
    // In React Native, we can't open popup windows like in browsers
    // Instead, we can try to open URLs using Linking API if available
    try {
      const Linking = require('expo-linking');
      if (Linking && Linking.openURL && typeof url === 'string') {
        console.log('📱 Opening URL with Linking API:', url);
        Linking.openURL(url).catch((error: any) => {
          console.warn('Failed to open URL with Linking:', error);
        });
        
        // Return a mock window object
        return {
          closed: false,
          close: () => {
            console.log('🔧 Mock window.close() called');
          },
          focus: () => {
            console.log('🔧 Mock window.focus() called');
          },
          blur: () => {
            console.log('🔧 Mock window.blur() called');
          },
          postMessage: (message: any, origin: string) => {
            console.log('🔧 Mock window.postMessage() called:', message, origin);
          }
        };
      }
    } catch (error) {
      console.warn('Linking API not available, window.open will return null');
    }
    
    // If we can't open the URL, return null (like a blocked popup)
    console.warn('🔧 window.open polyfill: Cannot open popup in React Native, returning null');
    return null;
  };
  console.log('✅ window.open polyfill added successfully');
}

// Also add to document if it exists
// @ts-ignore
if (global.document && !global.document.open) {
  // @ts-ignore
  global.document.open = function() {
    console.log('🔧 document.open polyfill called - no-op in React Native');
    return null;
  };
}

// Add other common window methods that might be needed
// @ts-ignore
if (global.window) {
  // @ts-ignore
  if (!global.window.close) {
    // @ts-ignore
    global.window.close = function() {
      console.log('🔧 window.close() polyfill called - no-op in React Native');
    };
  }
  
  // @ts-ignore
  if (!global.window.print) {
    // @ts-ignore
    global.window.print = function() {
      console.log('🔧 window.print() polyfill called - no-op in React Native');
    };
  }
  
  // @ts-ignore
  if (!global.window.confirm) {
    // @ts-ignore
    global.window.confirm = function(message) {
      console.log('🔧 window.confirm() polyfill called with:', message);
      return true; // Always return true in React Native
    };
  }
  
  // @ts-ignore
  if (!global.window.alert) {
    // @ts-ignore
    global.window.alert = function(message) {
      console.log('🔧 window.alert() polyfill called with:', message);
      // In React Native, we'd use Alert.alert(), but for compatibility just log
    };
  }
  
  // @ts-ignore
  if (!global.window.prompt) {
    // @ts-ignore
    global.window.prompt = function(message, defaultText) {
      console.log('🔧 window.prompt() polyfill called with:', message, defaultText);
      return defaultText || ''; // Return default or empty string
    };
  }
  
  // Add postMessage if missing
  // @ts-ignore
  if (!global.window.postMessage) {
    // @ts-ignore
    global.window.postMessage = function(message, origin) {
      console.log('🔧 window.postMessage() polyfill called:', message, 'to origin:', origin);
      // In React Native, we can't really post messages between windows
    };
  }
}

// @ts-ignore
if (typeof global.document === 'undefined') {
  // @ts-ignore
  global.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    createElement: () => {
      // Minimal HTMLElement mock
      return {
        addEventListener: () => {},
        removeEventListener: () => {},
        click: () => {},
        style: {},
        setAttribute: () => {},
        getAttribute: () => null,
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false,
          toggle: () => {},
        },
        appendChild: (child: any) => child,
        removeChild: (child: any) => child,
        querySelector: () => null,
        querySelectorAll: () => [],
        focus: () => {},
        blur: () => {},
        innerHTML: '',
        textContent: '',
        // Add any other properties as needed for compatibility
      } as unknown as HTMLElement;
    },
    body: {
      appendChild: (node: any) => node,
      removeChild: (node: any) => node,
      addEventListener: () => {},
      removeEventListener: () => {},
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {},
      },
      querySelector: () => null,
      querySelectorAll: () => [],
      focus: () => {},
      blur: () => {},
      innerHTML: '',
      textContent: '',
    } as unknown as HTMLElement,
    head: {
      appendChild: (node: any) => node,
      removeChild: (node: any) => node,
      addEventListener: () => {},
      removeEventListener: () => {},
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {},
      },
      querySelector: () => null,
      querySelectorAll: () => [],
      focus: () => {},
      blur: () => {},
      innerHTML: '',
      textContent: '',
    } as unknown as HTMLElement,
  };
}

// @ts-ignore
if (typeof global.navigator === 'undefined') {
  // @ts-ignore
  global.navigator = {
    userAgent: 'React Native',
    platform: 'mobile',
    onLine: true, // Force online state to prevent WalletConnect errors
  };
} else {
  // @ts-ignore
  global.navigator.onLine = true; // Override offline detection
}

// Try to keep navigator.onLine in sync with device connectivity (non-fatal)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const NetInfo = require('@react-native-community/netinfo').default;
  if (NetInfo && NetInfo.addEventListener) {
    NetInfo.addEventListener((state: any) => {
      const isOnline = Boolean(state?.isConnected && (state?.isInternetReachable ?? true));
      // @ts-ignore
      if (global?.navigator) {
        // @ts-ignore
        global.navigator.onLine = isOnline;
      }
      // Best-effort dispatch of online/offline events for libs listening on window
      // @ts-ignore
      const evtType = isOnline ? 'online' : 'offline';
      try {
        // @ts-ignore
        global.window?.dispatchEvent?.(new Event(evtType));
      } catch {
        // ignore
      }
    });
  }
} catch {
  // If NetInfo isn't available, keep onLine=true and continue
}

// @ts-ignore
if (typeof global.location === 'undefined') {
  // @ts-ignore
  global.location = {
    href: 'https://localhost',
    origin: 'https://localhost',
    protocol: 'https:',
    host: 'localhost',
    pathname: '/',
    search: '',
    hash: '',
  };
}

// Polyfill for addEventListener/removeEventListener
// @ts-ignore
if (!global.addEventListener) {
  // @ts-ignore
  global.addEventListener = () => {};
  // @ts-ignore
  global.removeEventListener = () => {};
  // @ts-ignore
  global.dispatchEvent = () => {};
}

// @ts-ignore
if (!global.window.addEventListener) {
  // @ts-ignore
  global.window.addEventListener = () => {};
  // @ts-ignore
  global.window.removeEventListener = () => {};
  // @ts-ignore
  global.window.dispatchEvent = () => true;
}

// Event constructor polyfill
// @ts-ignore
if (typeof global.Event === 'undefined') {
  // @ts-ignore
  global.Event = function Event(type: string, eventInitDict?: any) {
    // @ts-ignore
    this.type = type;
    // @ts-ignore
    this.bubbles = eventInitDict?.bubbles || false;
    // @ts-ignore
    this.cancelable = eventInitDict?.cancelable || false;
    // @ts-ignore
    this.composed = eventInitDict?.composed || false;
    // @ts-ignore
    this.detail = eventInitDict?.detail;
    // @ts-ignore
    return this;
  };
}

// CustomEvent constructor polyfill
// @ts-ignore
if (typeof global.CustomEvent === 'undefined') {
  // @ts-ignore
  global.CustomEvent = function CustomEvent(type: string, eventInitDict?: any) {
    // @ts-ignore
    this.type = type;
    // @ts-ignore
    this.bubbles = eventInitDict?.bubbles || false;
    // @ts-ignore
    this.cancelable = eventInitDict?.cancelable || false;
    // @ts-ignore
    this.composed = eventInitDict?.composed || false;
    // @ts-ignore
    this.detail = eventInitDict?.detail;
    // @ts-ignore
    return this;
  };
}

// TextEncoder/TextDecoder polyfill for React Native
// @ts-ignore
if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = class TextEncoder {
    encode(input: string): Uint8Array {
      const buffer = new ArrayBuffer(input.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < input.length; i++) {
        view[i] = input.charCodeAt(i);
      }
      return view;
    }
  };
}

// @ts-ignore
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = class TextDecoder {
    decode(input: Uint8Array): string {
      let result = '';
      for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input[i]);
      }
      return result;
    }
  };
}

// LocalStorage polyfill using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a simple cache for synchronous access
const storageCache = new Map<string, string>();

// Pre-populate the cache (async)
AsyncStorage.getAllKeys().then((keys) => {
  keys.forEach(async (key) => {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      storageCache.set(key, value);
    }
  });
});

// @ts-ignore
if (typeof global.localStorage === 'undefined') {
  // @ts-ignore
  global.localStorage = {
    getItem: (key: string) => {
      return storageCache.get(key) || null;
    },
    setItem: (key: string, value: string) => {
      storageCache.set(key, value);
      AsyncStorage.setItem(key, value).catch(() => {
        console.warn('Failed to save to AsyncStorage');
      });
    },
    removeItem: (key: string) => {
      storageCache.delete(key);
      AsyncStorage.removeItem(key).catch(() => {
        console.warn('Failed to remove from AsyncStorage');
      });
    },
    clear: () => {
      storageCache.clear();
      AsyncStorage.clear().catch(() => {
        console.warn('Failed to clear AsyncStorage');
      });
    },
  };
}

// ReactDOM polyfill for Origin SDK
// @ts-ignore
if (typeof global.ReactDOM === 'undefined') {
  // @ts-ignore
  global.ReactDOM = {
    createPortal: (children: any, container: any) => {
      // In React Native, we can't create portals to DOM elements
      // So we just return the children as-is
      return children;
    },
    render: (element: any, container: any) => {
      // Mock render function for Origin SDK compatibility
      return element;
    },
  };
}

// Add HTML element constructors that Origin SDK expects
// @ts-ignore
if (typeof global.HTMLElement === 'undefined') {
  // @ts-ignore
  global.HTMLElement = function HTMLElement() {
    return {
      addEventListener: () => {},
      removeEventListener: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {},
      },
      style: {},
      innerHTML: '',
      textContent: '',
      appendChild: (child: any) => child,
      removeChild: (child: any) => child,
      querySelector: () => null,
      querySelectorAll: () => [],
      click: () => {},
      focus: () => {},
      blur: () => {},
    };
  };
}

// Mock DOM methods that Origin SDK uses
// @ts-ignore
if (typeof global.document.querySelector === 'undefined') {
  // @ts-ignore
  global.document.querySelector = () => null;
  // @ts-ignore
  global.document.querySelectorAll = () => [];
  // @ts-ignore
  global.document.getElementById = () => null;
  // @ts-ignore
  global.document.getElementsByClassName = () => [];
  // @ts-ignore
  global.document.getElementsByTagName = () => [];
}

/**
 * Formats an Ethereum address by truncating it to show first and last n characters
 * @param address - The Ethereum address to format
 * @param n - Number of characters to show from start and end (default: 6)
 * @returns Formatted address string
 */
export const formatAddress = (address: string, n: number = 6): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, n)}...${address.slice(-n)}`;
};

console.log('✅ React Native polyfills loaded for Origin SDK');

// Additional browser API polyfills for WalletConnect/AppKit
// @ts-ignore
if (typeof global.requestAnimationFrame === 'undefined') {
  // @ts-ignore
  global.requestAnimationFrame = function(callback) {
    return setTimeout(callback, 16); // ~60fps
  };
}

// @ts-ignore
if (typeof global.cancelAnimationFrame === 'undefined') {
  // @ts-ignore
  global.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
}

// Add URL constructor polyfill if missing
// @ts-ignore
if (typeof global.URL === 'undefined') {
  // @ts-ignore
  global.URL = class URL {
    constructor(url, base) {
      // Basic URL parsing for React Native
      this.href = url;
      this.protocol = url.split(':')[0] + ':';
      this.origin = url.split('/').slice(0, 3).join('/');
      this.pathname = '/' + url.split('/').slice(3).join('/').split('?')[0].split('#')[0];
      this.search = url.includes('?') ? '?' + url.split('?')[1].split('#')[0] : '';
      this.hash = url.includes('#') ? '#' + url.split('#')[1] : '';
    }
  };
}

// Add URLSearchParams polyfill if missing
// @ts-ignore
if (typeof global.URLSearchParams === 'undefined') {
  // @ts-ignore
  global.URLSearchParams = class URLSearchParams {
    constructor(init) {
      this.params = new Map();
      if (typeof init === 'string') {
        init.replace(/^\?/, '').split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
        });
      }
    }
    
    get(name) {
      return this.params.get(name);
    }
    
    set(name, value) {
      this.params.set(name, value);
    }
    
    append(name, value) {
      this.params.set(name, value);
    }
    
    delete(name) {
      this.params.delete(name);
    }
    
    has(name) {
      return this.params.has(name);
    }
    
    toString() {
      const pairs = [];
      this.params.forEach((value, key) => {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });
      return pairs.join('&');
    }
  };
}

console.log('✅ Additional browser API polyfills loaded');

// Mock fetch for development to prevent network errors
if (__DEV__ && typeof global.fetch === 'undefined') {
  global.fetch = async (url: string | URL | Request, init?: RequestInit) => {
    console.warn('Mock fetch called for:', url);
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '{}',
      blob: async () => new Blob(),
    } as Response);
  };
}

// Navigation focus error fix - React Navigation sometimes has issues with focus detection
// @ts-ignore
if (typeof global.window !== 'undefined' && !global.window.hasFocus) {
  // @ts-ignore
  global.window.hasFocus = function() {
    return true; // Always return true for React Native
  };
}

// Add comprehensive focus polyfills to prevent "r.hasFocus is not a function" errors
// @ts-ignore
if (typeof global.document !== 'undefined') {
  // @ts-ignore
  const originalAddEventListener = global.document.addEventListener || (() => {});
  // @ts-ignore
  global.document.addEventListener = function(type, listener, options) {
    if (type === 'focus' || type === 'blur' || type === 'focusin' || type === 'focusout') {
      // Mock focus events for React Native - don't add actual listeners
      return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // @ts-ignore
  const originalRemoveEventListener = global.document.removeEventListener || (() => {});
  // @ts-ignore
  global.document.removeEventListener = function(type, listener, options) {
    if (type === 'focus' || type === 'blur' || type === 'focusin' || type === 'focusout') {
      // Mock focus events for React Native - don't remove actual listeners
      return;
    }
    return originalRemoveEventListener.call(this, type, listener, options);
  };
}

// Add focus polyfill to navigation objects that might be missing it
const originalGlobalAddEventListener = global.addEventListener || (() => {});
// @ts-ignore
global.addEventListener = function(type: string, listener: any, options?: any) {
  if (type === 'focus' || type === 'blur' || type === 'focusin' || type === 'focusout') {
    // Mock focus events for React Native
    return;
  }
  return originalGlobalAddEventListener.call(this, type, listener, options);
};

// Window focus/blur events polyfill
// @ts-ignore
if (global.window && !global.window.onfocus) {
  // @ts-ignore
  global.window.onfocus = () => {};
  // @ts-ignore
  global.window.onblur = () => {};
  // @ts-ignore
  global.window.focus = () => {};
  // @ts-ignore
  global.window.blur = () => {};
}

// Fix for React Navigation state management
// @ts-ignore
if (typeof global.navigator === 'undefined') {
  // @ts-ignore
  global.navigator = {
    userAgent: 'React Native',
    platform: 'mobile',
    onLine: true,
  };
}

// Add missing properties to prevent navigation errors
// @ts-ignore
if (global.navigator && typeof global.navigator.getCurrentPosition === 'undefined') {
  // @ts-ignore
  global.navigator.getCurrentPosition = () => {};
  // @ts-ignore
  global.navigator.watchPosition = () => {};
  // @ts-ignore
  global.navigator.clearWatch = () => {};
}

// Targeted fix for "r.hasFocus is not a function" error
// This error typically occurs when React Navigation or AppKit tries to check window focus
try {
  // Add hasFocus to any object that might need it
  const addHasFocusPolyfill = (obj: any, name: string) => {
    if (obj && typeof obj === 'object') {
      if (!obj.hasFocus) {
        obj.hasFocus = function() {
          console.log(`🔧 hasFocus polyfill called on ${name}`);
          return true;
        };
      }
      
      // Also add other focus-related methods that might be missing
      if (!obj.focus) {
        obj.focus = function() {
          console.log(`🔧 focus polyfill called on ${name}`);
        };
      }
      
      if (!obj.blur) {
        obj.blur = function() {
          console.log(`🔧 blur polyfill called on ${name}`);
        };
      }
    }
  };

  // @ts-ignore
  addHasFocusPolyfill(global.window, 'window');
  // @ts-ignore
  addHasFocusPolyfill(global.document, 'document');
  // @ts-ignore
  addHasFocusPolyfill(global, 'global');
  
  // Add to document.body if it exists
  // @ts-ignore
  if (global.document && global.document.body) {
    // @ts-ignore
    addHasFocusPolyfill(global.document.body, 'document.body');
  }

  console.log('🔧 hasFocus polyfills added to global objects');
} catch (error) {
  console.warn('Could not add hasFocus polyfills:', error);
}

// Override common navigation/focus detection patterns
try {
  // Intercept any function that might call hasFocus
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = function(callback: Function, delay?: number, ...args: any[]) {
    const wrappedCallback = function() {
      try {
        return callback.apply(this, arguments);
      } catch (error: any) {
        if (error.message && error.message.includes('hasFocus')) {
          console.warn('🔧 hasFocus error in setTimeout callback caught:', error.message);
          return;
        }
        throw error;
      }
    };
    return originalSetTimeout.call(this, wrappedCallback, delay, ...args);
  };

  console.log('🔧 setTimeout wrapper added for hasFocus protection');
} catch (error) {
  console.warn('Could not add setTimeout wrapper:', error);
}

console.log('✅ Targeted hasFocus polyfills loaded');

// Global error handler to catch unhandled focus errors
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('hasFocus is not a function')) {
    console.warn('🔧 Intercepted hasFocus error and suppressing:', message);
    return; // Suppress this specific error
  }
  return originalConsoleError.apply(console, args);
};

// Global promise rejection handler for focus errors
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.addEventListener = global.addEventListener || function() {};
  
  try {
    // @ts-ignore
    global.addEventListener('unhandledrejection', function(event) {
      if (event.reason && event.reason.message && event.reason.message.includes('hasFocus')) {
        console.warn('🔧 Unhandled focus error caught and prevented:', event.reason.message);
        event.preventDefault();
      }
    });
  } catch (e) {
    console.warn('Could not add unhandledrejection listener:', e);
  }
}

console.log('🔧 Global focus error handlers installed');

// Aggressive window.open polyfill that re-applies itself periodically
// This fixes race conditions where other libraries might overwrite our polyfill
let windowOpenPolyfillApplied = false;

const applyWindowOpenPolyfill = () => {
  // @ts-ignore
  if (global.window && (!global.window.open || global.window.open.toString().includes('[native code]'))) {
    console.log('🔧 Applying/re-applying window.open polyfill...');
    // @ts-ignore
    global.window.open = function(url, target, features) {
      console.log('🔧 window.open polyfill called with URL:', url);
      
      // Try using Linking API if available
      try {
        const Linking = require('expo-linking');
        if (Linking && Linking.openURL && typeof url === 'string') {
          console.log('📱 Opening URL with Linking API:', url);
          Linking.openURL(url).catch((error: any) => {
            console.warn('Failed to open URL with Linking:', error);
          });
          
          // Return a mock window object
          return {
            closed: false,
            close: () => console.log('🔧 Mock window.close() called'),
            focus: () => console.log('🔧 Mock window.focus() called'),
            blur: () => console.log('🔧 Mock window.blur() called'),
            postMessage: (message: any, origin: string) => 
              console.log('🔧 Mock window.postMessage() called:', message, origin)
          };
        }
      } catch (error) {
        console.warn('Linking API not available, window.open will return null');
      }
      
      console.warn('🔧 window.open polyfill: Cannot open popup in React Native, returning null');
      return null;
    };
    windowOpenPolyfillApplied = true;
    console.log('✅ window.open polyfill applied successfully');
  }
};

// Apply immediately
applyWindowOpenPolyfill();

// Re-apply periodically to catch race conditions
setInterval(() => {
  if (!windowOpenPolyfillApplied) {
    applyWindowOpenPolyfill();
  }
}, 100);

// Also apply on next tick
setTimeout(applyWindowOpenPolyfill, 0);
setTimeout(applyWindowOpenPolyfill, 10);
setTimeout(applyWindowOpenPolyfill, 100);

console.log('🔧 Aggressive window.open polyfill protection installed');

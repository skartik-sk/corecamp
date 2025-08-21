import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccount } from 'wagmi';
import { useCampNetworkSDK } from '@/hooks/useCampNetworkSDK';
import { Colors } from '@/constants/Colors';
import { 
  Home,
  Store, 
  Plus,
  MessageCircle,
  User,
  Dice6,
  Sparkles,
  Zap,
  Wallet,
  LogOut,
} from 'lucide-react-native';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'Auctions', href: '/auctions', icon: Dice6 },
  { name: 'Create', href: '/create', icon: Plus, authRequired: true },
  { name: 'Chat', href: '/chat', icon: MessageCircle, authRequired: true },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { address } = useAccount();
  const campSDK = useCampNetworkSDK();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleAuth = async () => {
    try {
      if (campSDK.isAuthenticated) {
        await campSDK.signOut();
        setUserMenuOpen(false);
      } else {
        // Use global AppKit helper
        (global as any).openAppKit?.();
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href as any);
  };

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        {/* Logo */}
        <TouchableOpacity 
          style={styles.logo}
          onPress={() => handleNavigation('/')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={Colors.gradients.primary as any}
            style={styles.logoIcon}
          >
            <Sparkles size={24} color="white" />
            <View style={styles.logoDot} />
          </LinearGradient>
          <View style={styles.logoText}>
            <Text style={styles.logoTitle}>CoreCamp</Text>
            <Text style={styles.logoSubtitle}>Create. Own.{'\n'}Register. Earn</Text>
          </View>
        </TouchableOpacity>

        {/* Auth Section */}
        <View style={styles.authSection}>
          {campSDK.isAuthenticated ? (
            <TouchableOpacity
              style={styles.connectedButton}
              onPress={() => setUserMenuOpen(!userMenuOpen)}
              activeOpacity={0.8}
            >
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Connected</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleAuth}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Colors.gradients.primary as any}
                style={styles.connectGradient}
              >
                <Wallet size={20} color="white" />
                <Text style={styles.connectText}>Connect</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.navigation}>
        {navigation.map((item) => {
          const isVisible = !item.authRequired || campSDK.isAuthenticated;
          if (!isVisible) return null;

          const isActive = pathname === item.href;
          const IconComponent = item.icon;

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleNavigation(item.href)}
              activeOpacity={0.7}
            >
              {isActive && (
                <LinearGradient
                  colors={Colors.gradients.primary as any}
                  style={styles.navItemBackground}
                />
              )}
              <IconComponent 
                size={16} 
                color={isActive ? 'white' : Colors['cool-1']} 
              />
              <Text style={[
                styles.navItemText,
                isActive && styles.navItemTextActive
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User Menu Overlay */}
      {userMenuOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayBackground}
            onPress={() => setUserMenuOpen(false)}
            activeOpacity={1}
          />
          <View style={styles.userMenu}>
            <TouchableOpacity
              style={styles.userMenuItem}
              onPress={() => {
                setUserMenuOpen(false);
                // Open profile modal
              }}
            >
              <User size={16} color={Colors['cool-1']} />
              <Text style={styles.userMenuText}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.userMenuItem, styles.userMenuItemDanger]}
              onPress={handleAuth}
            >
              <LogOut size={16} color={Colors.error} />
              <Text style={styles.userMenuTextDanger}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(162, 213, 209, 0.2)',
    paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight || 44 : StatusBar.currentHeight || 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  logoDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: Colors['warm-2'],
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  logoText: {
    marginLeft: 12,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors['camp-dark'],
    fontFamily: 'Inter_800ExtraBold',
  },
  logoSubtitle: {
    fontSize: 10,
    color: Colors['cool-1'],
    fontWeight: '500',
    lineHeight: 12,
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  authSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectButton: {
    borderRadius: 16,
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  connectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  connectText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  connectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  connectedDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.success,
    borderRadius: 4,
    marginRight: 8,
  },
  connectedText: {
    color: Colors.success,
    fontWeight: '500',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 4,
  },
  navItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    position: 'relative',
  },
  navItemActive: {
    // Background will be applied by LinearGradient
  },
  navItemBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  navItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors['cool-1'],
    marginLeft: 6,
    fontFamily: 'Inter_500Medium',
  },
  navItemTextActive: {
    color: 'white',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  userMenu: {
    position: 'absolute',
    top: 120,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 180,
    paddingVertical: 8,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMenuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  userMenuText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: Colors['camp-dark'],
    fontFamily: 'Inter_500Medium',
  },
  userMenuTextDanger: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.error,
    fontFamily: 'Inter_500Medium',
  },
});

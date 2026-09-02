import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { useToast } from '../../../components/ui/Toast';
import { restaurantsApi } from '../../../api/restaurants';
import { useRestaurantStore } from '../../../stores/restaurantStore';
import { useCartStore } from '../../../stores/cartStore';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';

export default function QRScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanned, setScanned] = useState(false);
  const { setCurrentRestaurant } = useRestaurantStore();
  const { setActiveRestaurant } = useCartStore();

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isProcessing) return;
    setScanned(true);
    setIsProcessing(true);

    try {
      // Validate: must match restaurantapp://restaurant/{id}
      const match = data.match(/^restaurantapp:\/\/restaurant\/(.+)$/);
      if (!match) {
        toast.error('Invalid QR Code', 'This QR code is not for FoodieApp');
        setScanned(false);
        setIsProcessing(false);
        return;
      }

      const restaurant = await restaurantsApi.getRestaurantByQR(data);

      if (!restaurant.isActive) {
        toast.warning('Unavailable', 'This restaurant is currently not accepting orders');
        setScanned(false);
        setIsProcessing(false);
        return;
      }

      setCurrentRestaurant(restaurant);
      setActiveRestaurant(restaurant.id, restaurant.taxRate, restaurant.deliveryFee);
      router.replace('/(app)/(tabs)');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load restaurant';
      toast.error('Scan failed', msg);
      setScanned(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return <View style={[styles.root, { backgroundColor: '#000' }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionRoot, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.permissionContent, { paddingTop: insets.top + spacing[6] }]}>
          <AppText style={styles.bigEmoji}>📷</AppText>
          <AppText variant="titleSmall" color={theme.colors.text} weight="600" align="center">
            Camera permission needed
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} align="center">
            Allow camera access to scan restaurant QR codes
          </AppText>
          <Button
            label="Grant Permission"
            variant="primary"
            size="large"
            onPress={requestPermission}
            style={styles.permBtn}
          />
          <Button
            label="Go Back"
            variant="ghost"
            size="medium"
            onPress={() => router.back()}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay */}
      <View style={[styles.overlay, { paddingTop: insets.top + spacing[4] }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Close QR scanner"
          >
            <AppText color="#fff" variant="titleSmall">✕</AppText>
          </TouchableOpacity>
          <AppText variant="titleSmall" color="#fff" weight="600">
            Scan QR Code
          </AppText>
          <View style={{ width: 44 }} />
        </View>

        {/* Viewfinder */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.instructions, { paddingBottom: insets.bottom + spacing[6] }]}>
          <AppText variant="body" color="#fff" align="center" weight="500">
            Point at a restaurant QR code
          </AppText>
          <AppText variant="small" color="rgba(255,255,255,0.7)" align="center">
            The code will be scanned automatically
          </AppText>

          {scanned && !isProcessing && (
            <Button
              label="Scan Again"
              variant="secondary"
              size="medium"
              onPress={() => setScanned(false)}
              style={styles.rescanBtn}
            />
          )}
        </View>
      </View>

      <LoadingOverlay visible={isProcessing} message="Loading restaurant..." transparent />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionRoot: {
    flex: 1,
  },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[4],
  },
  bigEmoji: {
    fontSize: 64,
    marginBottom: spacing[2],
  },
  permBtn: {
    width: '100%',
    marginTop: spacing[2],
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#fff',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: radius.sm,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: radius.sm,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: radius.sm,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: radius.sm,
  },
  instructions: {
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[6],
  },
  rescanBtn: {
    marginTop: spacing[3],
    minWidth: 160,
  },
});

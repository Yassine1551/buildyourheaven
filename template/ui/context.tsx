// @ts-nocheck
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import { AlertButton, AlertState } from './types';

// Context type definition
interface AlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

// Create Context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// AlertProvider - unified platform handling
interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const showAlert = (
    title: string,
    message?: string,
    buttons?: AlertButton[]
  ) => {
    // Parameter normalization
    const normalizedMessage = message || '';
    const normalizedButtons = buttons?.length ? buttons : [{ 
      text: 'OK',
      onPress: () => {}
    }];

    setAlertState({
      visible: true,
      title,
      message: normalizedMessage,
      buttons: normalizedButtons
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  const handleButtonPress = (button: AlertButton) => {
    try {
      
      if (typeof button.onPress === 'function') {
        button.onPress();
      }
      
      hideAlert();
    } catch (error) {
      console.warn('[Template:AlertProvider] Button press error:', error);
      hideAlert();
    }
  };

  const contextValue: AlertContextType = {
    showAlert
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <WebAlertModal
        alertState={alertState}
        onButtonPress={handleButtonPress}
        onHide={hideAlert}
      />
    </AlertContext.Provider>
  );
}

// useAlertContext Hook - internal use
export function useAlertContext(): AlertContextType {
  const context = useContext(AlertContext);
  
  if (context === undefined) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  
  return context;
}

// Internal Web Alert Modal Component
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface WebAlertModalProps {
  alertState: AlertState;
  onButtonPress: (button: AlertButton) => void;
  onHide: () => void;
}

function WebAlertModal({ alertState, onButtonPress, onHide }: WebAlertModalProps) {
  if (!alertState.visible) {
    return null;
  }

  // Determine button style
  const getButtonStyle = (button: AlertButton, index: number) => {
    const isLast = index === alertState.buttons.length - 1;
    const baseStyle = [styles.button];
    
    if (alertState.buttons.length > 1 && !isLast) {
      baseStyle.push(styles.buttonWithBorder);
    }
    
    return baseStyle;
  };

  // Determine button text style
  const getButtonTextStyle = (button: AlertButton) => {
    switch (button.style) {
      case 'cancel':
        return styles.cancelButtonText;
      case 'destructive':
        return styles.destructiveButtonText;
      default:
        return styles.defaultButtonText;
    }
  };

  return (
    <Modal visible={alertState.visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{alertState.title}</Text>
            {alertState.message ? (
              <Text style={styles.message}>{alertState.message}</Text>
            ) : null}
          </View>
          
          <View style={styles.buttonContainer}>
            {alertState.buttons.length === 1 ? (
              // Single button layout
              <TouchableOpacity 
                style={[styles.button, styles.singleButton]}
                onPress={() => onButtonPress(alertState.buttons[0])}
                activeOpacity={0.8}
              >
                <Text style={getButtonTextStyle(alertState.buttons[0])}>
                  {alertState.buttons[0].text}
                </Text>
              </TouchableOpacity>
            ) : (
              // Multiple button layout (horizontal)
              <View style={styles.multiButtonContainer}>
                {alertState.buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={getButtonStyle(button, index)}
                    onPress={() => onButtonPress(button)}
                    activeOpacity={0.8}
                  >
                    <Text style={getButtonTextStyle(button)}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: '#064E3B',
    borderRadius: 20,
    minWidth: 280,
    maxWidth: 420,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D4AF37',
    marginBottom: 8,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  message: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    writingDirection: 'rtl',
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.15)',
  },
  multiButtonContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    flex: 1,
    backgroundColor: 'transparent',
  },
  singleButton: {
    flex: 0,
    width: '100%',
  },
  buttonWithBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(212,175,55,0.15)',
  },
  defaultButtonText: {
    color: '#D4AF37',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 17,
    fontWeight: '600',
  },
  destructiveButtonText: {
    color: '#EF4444',
    fontSize: 17,
    fontWeight: '700',
  },
});
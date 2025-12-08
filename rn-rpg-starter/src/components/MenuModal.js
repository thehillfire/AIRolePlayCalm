import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { calmTheme } from '../constants/calmTheme';
import { playButtonClick, playDeepClick } from '../services/calmSoundService';

export default function MenuModal({ visible, onClose, onChatPress, onInventoryPress, onLogoutPress, onContactsPress }) {
  // Add onContactsPress to props
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              playButtonClick(0.08);
              onContactsPress();
              onClose();
            }}
          >
            <Text style={styles.menuIcon}>👥</Text>
            <Text style={styles.menuText}>CONTACTS</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              playButtonClick(0.08);
              onChatPress();
              onClose();
            }}
          >
            <Text style={styles.menuIcon}>💬</Text>
            <Text style={styles.menuText}>CHAT</Text>
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              playButtonClick(0.08);
              onInventoryPress();
              onClose();
            }}
          >
            <Text style={styles.menuIcon}>📖</Text>
            <Text style={styles.menuText}>STORYLOGS</Text>
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              // deep click for logout/back style action
              playDeepClick(0.14);
              onLogoutPress();
              onClose();
            }}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={styles.menuText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: calmTheme.background.primary,
    borderRadius: calmTheme.radius.md,
    borderWidth: 1,
    borderColor: calmTheme.glow.soft,
    shadowColor: calmTheme.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 180,
    paddingVertical: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    color: calmTheme.text.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  separator: {
    height: 1,
    backgroundColor: calmTheme.glow.soft,
    opacity: 0.15,
  },
});
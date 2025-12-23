/**
 * Settings Screen
 * Central hub for master data management and app settings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProjects } from '../context/ProjectContext';
import { useMaterials } from '../context/MaterialContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';
import { Card } from '../components';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootTabParamList, RootStackParamList } from '../../App';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { projects } = useProjects();
  const { materials } = useMaterials();

  const masterDataItems = [
    {
      id: 'projects',
      title: 'Manage Projects',
      subtitle: `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`,
      icon: 'briefcase-outline' as keyof typeof Ionicons.glyphMap,
      color: COLORS.PRIMARY,
      onPress: () => navigation.navigate('Projects'),
    },
    {
      id: 'materials',
      title: 'Manage Materials',
      subtitle: `${materials.length} material types`,
      icon: 'cube-outline' as keyof typeof Ionicons.glyphMap,
      color: COLORS.SECONDARY,
      onPress: () => navigation.navigate('MaterialManagement'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="settings" size={28} color={COLORS.WHITE} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Master data & configuration</Text>
          </View>
        </View>
      </Card>

      {/* Master Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Master Data</Text>
        <Text style={styles.sectionDescription}>
          Manage core data used throughout the app
        </Text>

        <Card style={styles.optionsCard}>
          {masterDataItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
              {index < masterDataItems.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Ionicons name="information-circle" size={24} color={COLORS.PRIMARY} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>About Master Data</Text>
              <Text style={styles.infoText}>
                Master data includes projects and materials that are used across the app.
                Manage them here to keep your data organized and up-to-date.
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Placeholder for Future Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <Card style={styles.optionsCard}>
          <View style={styles.optionButton}>
            <View style={[styles.optionIcon, { backgroundColor: COLORS.TEXT_SECONDARY + '15' }]}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.TEXT_SECONDARY} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, styles.disabledText]}>Notifications</Text>
              <Text style={[styles.optionSubtitle, styles.disabledText]}>
                Payment reminders & alerts
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.optionButton}>
            <View style={[styles.optionIcon, { backgroundColor: COLORS.TEXT_SECONDARY + '15' }]}>
              <Ionicons name="cloud-outline" size={24} color={COLORS.TEXT_SECONDARY} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, styles.disabledText]}>Backup & Sync</Text>
              <Text style={[styles.optionSubtitle, styles.disabledText]}>
                Cloud backup settings
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.optionButton}>
            <View style={[styles.optionIcon, { backgroundColor: COLORS.TEXT_SECONDARY + '15' }]}>
              <Ionicons name="shield-outline" size={24} color={COLORS.TEXT_SECONDARY} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, styles.disabledText]}>Security</Text>
              <Text style={[styles.optionSubtitle, styles.disabledText]}>
                PIN & biometric lock
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* App Info */}
      <View style={styles.appInfoSection}>
        <Text style={styles.appInfoText}>Construction Payment Manager</Text>
        <Text style={styles.appVersionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  headerCard: {
    margin: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  optionsCard: {
    padding: 0,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.GREY_LIGHT,
    marginLeft: SPACING.lg + 48 + SPACING.md,
  },
  disabledText: {
    opacity: 0.5,
  },
  infoCard: {
    backgroundColor: COLORS.PRIMARY + '08',
    borderColor: COLORS.PRIMARY + '30',
  },
  infoContent: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  appInfoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
  },
  appVersionText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_LIGHT,
  },
});

export default SettingsScreen;

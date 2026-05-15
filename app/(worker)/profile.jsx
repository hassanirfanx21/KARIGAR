import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

export default function WorkerProfileScreen() {
  const router = useRouter();
  const [notificationsOn, setNotificationsOn] = useState(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsBtn}><Text style={{ fontSize: 20 }}>⚙️</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.profileHero}>
          <View style={styles.heroDecor} />
          <View style={styles.avatarRing}>
            <View style={styles.heroAvatar}><Text style={styles.heroAvatarText}>AK</Text></View>
          </View>
          <Text style={styles.heroName}>Ahmed Khan</Text>
          <Text style={styles.heroPhone}>+92 300 1234567</Text>
          <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Verified Karigar</Text></View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[{ label: 'Rating', value: '4.8', icon: '⭐' }, { label: 'Jobs', value: '47' }, { label: 'Earnings', value: '12.4K' }].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  {s.icon && <Text style={{ fontSize: 12, marginBottom: 2 }}>{s.icon}</Text>}
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
            <Text style={styles.editBtnText}>Profile Edit Karein</Text>
          </TouchableOpacity>
        </View>

        {/* Service Categories */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>SERVICES</Text>
          <View style={styles.sectionCard}>
            <View style={styles.servicesGrid}>
              {[
                { emoji: '⚡', label: 'Electrician' },
                { emoji: '❄️', label: 'AC Repair' },
                { emoji: '🔧', label: 'Plumbing' },
              ].map(s => (
                <View key={s.label} style={styles.serviceTag}>
                  <Text style={{ fontSize: 16 }}>{s.emoji}</Text>
                  <Text style={styles.serviceTagText}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Work Info */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>WORK INFORMATION</Text>
          <View style={styles.sectionCard}>
            {[
              { icon: '📍', label: 'Area', value: 'Gulberg, Lahore' },
              { icon: '📏', label: 'Range', value: '10 km' },
              { icon: '⏰', label: 'Hours', value: '9:00 AM – 6:00 PM' },
              { icon: '📅', label: 'Experience', value: '3 years' },
              { icon: '💰', label: 'Rate', value: 'PKR 500/hr' },
            ].map((row, i, arr) => (
              <React.Fragment key={row.label}>
                <View style={styles.listRow}>
                  <View style={styles.listRowLeft}>
                    <View style={styles.listIconWrap}><Text style={{ fontSize: 16 }}>{row.icon}</Text></View>
                    <Text style={styles.listLabel}>{row.label}</Text>
                  </View>
                  <Text style={styles.listValue}>{row.value}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
          <View style={styles.sectionCard}>
            {[
              { icon: '📞', label: 'Phone', value: '+92 300 1234567' },
              { icon: '📧', label: 'Email', value: 'ahmed.khan@example.com' },
              { icon: '🪪', label: 'CNIC', value: '35201-XXXXXXX-X' },
            ].map((row, i, arr) => (
              <React.Fragment key={row.label}>
                <View style={styles.listRow}>
                  <View style={styles.listRowLeft}>
                    <View style={styles.listIconWrap}><Text style={{ fontSize: 16 }}>{row.icon}</Text></View>
                    <Text style={styles.listLabel}>{row.label}</Text>
                  </View>
                  <Text style={styles.listValue}>{row.value}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>APP SETTINGS</Text>
          <View style={styles.sectionCard}>
            <View style={styles.listRow}>
              <View style={styles.listRowLeft}>
                <View style={styles.listIconWrap}><Text style={{ fontSize: 16 }}>🔔</Text></View>
                <Text style={styles.listLabel}>Notifications</Text>
              </View>
              <Switch value={notificationsOn} onValueChange={setNotificationsOn}
                trackColor={{ false: Colors.darkBorder, true: Colors.goldPrimary }}
                thumbColor={notificationsOn ? Colors.charcoalDeep : Colors.textMuted} />
            </View>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.listRow}>
              <View style={styles.listRowLeft}>
                <View style={styles.listIconWrap}><Text style={{ fontSize: 16 }}>🌐</Text></View>
                <Text style={styles.listLabel}>Language</Text>
              </View>
              <Text style={styles.listValue}>Roman Urdu</Text>
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.listRow}>
              <View style={styles.listRowLeft}>
                <View style={styles.listIconWrap}><Text style={{ fontSize: 16 }}>❓</Text></View>
                <Text style={styles.listLabel}>Help & Support</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.listRow} onPress={() => {
              Alert.alert('Logout', 'Kya aap logout karna chahte hain?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: () => router.replace('/'), style: 'destructive' },
              ]);
            }}>
              <View style={styles.listRowLeft}>
                <View style={[styles.listIconWrap, { backgroundColor: `${Colors.errorRed}15` }]}>
                  <Text style={{ fontSize: 16 }}>🚪</Text>
                </View>
                <Text style={[styles.listLabel, { color: Colors.errorRed }]}>Logout</Text>
              </View>
              <Text style={[styles.chevron, { color: Colors.errorRed }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.darkBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { color: Colors.textOnDark, fontSize: 22, fontWeight: '800' },
  settingsBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.darkCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.darkBorder },
  scrollContent: { paddingBottom: 40 },
  profileHero: { backgroundColor: Colors.darkCard, marginHorizontal: 16, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: Colors.darkBorder, overflow: 'hidden', ...Shadows.cardHeavy },
  heroDecor: { position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: 90, backgroundColor: `${Colors.goldPrimary}08` },
  avatarRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 2.5, borderColor: Colors.goldPrimary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroAvatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.brownMatte, alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { color: Colors.textOnDark, fontSize: 28, fontWeight: '700' },
  heroName: { color: Colors.textOnDark, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  heroPhone: { color: Colors.textMuted, fontSize: 13, marginBottom: 10 },
  verifiedBadge: { backgroundColor: `${Colors.successGreen}20`, paddingHorizontal: 14, paddingVertical: 4, borderRadius: Radius.full, marginBottom: 16 },
  verifiedText: { color: Colors.successGreen, fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', width: '100%', marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.goldPrimary, fontSize: 22, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.darkBorder },
  editBtn: { backgroundColor: Colors.goldPrimary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14, ...Shadows.goldFloat },
  editBtnText: { color: Colors.charcoalDeep, fontSize: 14, fontWeight: '800' },
  sectionWrap: { paddingHorizontal: 16, marginBottom: 14 },
  sectionLabel: { color: Colors.goldPrimary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  sectionCard: { backgroundColor: Colors.darkCard, borderRadius: 18, borderWidth: 1, borderColor: Colors.darkBorder, overflow: 'hidden' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
  serviceTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${Colors.goldPrimary}15`, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  serviceTagText: { color: Colors.goldPrimary, fontSize: 13, fontWeight: '700' },
  listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
  listRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  listIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: `${Colors.goldPrimary}15`, alignItems: 'center', justifyContent: 'center' },
  listLabel: { color: Colors.textOnDark, fontSize: 14, fontWeight: '600' },
  listValue: { color: Colors.textMuted, fontSize: 12 },
  chevron: { color: Colors.charcoalLight, fontSize: 20, fontWeight: '300' },
  rowDivider: { height: 1, backgroundColor: Colors.darkBorder, marginHorizontal: 16 },
  versionText: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 },
});

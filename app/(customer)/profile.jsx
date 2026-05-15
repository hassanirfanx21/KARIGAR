import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

function ListRow({ icon, label, value, onPress, danger, toggle, toggleValue, onToggle }) {
  return (
    <TouchableOpacity style={styles.listRow} onPress={onPress} activeOpacity={toggle ? 1 : 0.7}>
      <View style={styles.listRowLeft}>
        <View style={[styles.listIconWrap, danger && { backgroundColor: `${Colors.errorRed}15` }]}>
          <Text style={{ fontSize: 16 }}>{icon}</Text>
        </View>
        <Text style={[styles.listLabel, danger && styles.listLabelDanger]}>{label}</Text>
      </View>
      <View style={styles.listRowRight}>
        {value && <Text style={styles.listValue}>{value}</Text>}
        {toggle && (
          <Switch value={toggleValue} onValueChange={onToggle}
            trackColor={{ false: Colors.darkBorder, true: Colors.goldPrimary }}
            thumbColor={toggleValue ? Colors.charcoalDeep : Colors.textMuted} />
        )}
        {!toggle && <Text style={[styles.chevron, danger && { color: Colors.errorRed }]}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
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
          <View style={styles.avatarRing}>
            <View style={styles.heroAvatar}><Text style={styles.heroAvatarText}>AK</Text></View>
          </View>
          <Text style={styles.heroName}>Ahmed Khan</Text>
          <Text style={styles.heroPhone}>+92 300 1234567</Text>
          <View style={styles.statsRow}>
            {[{ label: 'Bookings', value: '12' }, { label: 'Reviews', value: '8' }, { label: 'Points', value: '340' }].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
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

        {/* Personal Info */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
          <View style={styles.sectionCard}>
            <ListRow icon="📞" label="Phone" value="+92 300 1234567" />
            <View style={styles.rowDivider} />
            <ListRow icon="📧" label="Email" value="ahmed@example.com" />
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>SAVED ADDRESSES</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.listRow} activeOpacity={0.75}>
              <View style={styles.listRowLeft}>
                <View style={styles.listIconWrap}><Text style={{ fontSize: 16 }}>🏠</Text></View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.listLabel}>Ghar</Text>
                    <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>DEFAULT</Text></View>
                  </View>
                  <Text style={styles.addressSub}>House 42, Street 5, G-13, Islamabad</Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>APP SETTINGS</Text>
          <View style={styles.sectionCard}>
            <ListRow icon="🔔" label="Notifications" toggle toggleValue={notificationsOn} onToggle={setNotificationsOn} />
            <View style={styles.rowDivider} />
            <ListRow icon="🌐" label="Language" value="Roman Urdu" />
            <View style={styles.rowDivider} />
            <ListRow icon="❓" label="Help & Support" />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionCard}>
            <ListRow icon="🚪" label="Logout" danger onPress={() => {
              Alert.alert('Logout', 'Kya aap logout karna chahte hain?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: () => router.replace('/'), style: 'destructive' },
              ]);
            }} />
          </View>
        </View>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.darkBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.darkBg },
  headerTitle: { color: Colors.textOnDark, fontSize: 22, fontWeight: '800' },
  settingsBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.darkCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.darkBorder },
  scrollContent: { paddingBottom: 40 },
  profileHero: { backgroundColor: Colors.darkCard, marginHorizontal: 16, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: Colors.darkBorder, ...Shadows.cardHeavy },
  avatarRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 2.5, borderColor: Colors.goldPrimary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroAvatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.brownMatte, alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { color: Colors.textOnDark, fontSize: 28, fontWeight: '700' },
  heroName: { color: Colors.textOnDark, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  heroPhone: { color: Colors.textMuted, fontSize: 13, marginBottom: 20 },
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
  listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
  listRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  listIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: `${Colors.goldPrimary}15`, alignItems: 'center', justifyContent: 'center' },
  listLabel: { color: Colors.textOnDark, fontSize: 14, fontWeight: '600' },
  listLabelDanger: { color: Colors.errorRed, fontWeight: '600', fontSize: 14 },
  listRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listValue: { color: Colors.textMuted, fontSize: 12 },
  chevron: { color: Colors.charcoalLight, fontSize: 20, fontWeight: '300' },
  rowDivider: { height: 1, backgroundColor: Colors.darkBorder, marginHorizontal: 16 },
  defaultBadge: { backgroundColor: `${Colors.goldPrimary}20`, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  defaultBadgeText: { color: Colors.goldPrimary, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  addressSub: { color: Colors.textMuted, fontSize: 11, marginTop: 2, maxWidth: 200 },
  versionText: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 },
});

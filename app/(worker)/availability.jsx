import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Shadows, Spacing, Radius } from "../../constants/theme";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AvailabilityScreen() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("06:00 PM");
  const [range, setRange] = useState("10");
  const [activeDays, setActiveDays] = useState([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const [autoAccept, setAutoAccept] = useState(false);

  const toggleDay = (day) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Availability</Text>
        <Text style={styles.headerSub}>Apna kaam ka waqt set karein</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Toggle */}
        <View style={styles.masterCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.masterTitle}>
              {isAvailable ? "● Available" : "○ Unavailable"}
            </Text>
            <Text style={styles.masterSub}>
              {isAvailable
                ? "Aap abhi bookings le sakte hain"
                : "Bookings band hain"}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: "#3a3a3a", true: Colors.goldPrimary }}
            thumbColor={isAvailable ? Colors.charcoalDeep : Colors.textMuted}
          />
        </View>

        {/* Working Days */}
        <Text style={styles.sectionLabel}>KAAM KE DIN</Text>
        <View style={styles.daysCard}>
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day) => {
              const active = activeDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.dayText, active && styles.dayTextActive]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.daysInfo}>{activeDays.length} din selected</Text>
        </View>

        {/* Working Hours */}
        <Text style={styles.sectionLabel}>KAAM KA WAQT</Text>
        <View style={styles.hoursCard}>
          <View style={styles.timeRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Start</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeValue}>{startTime}</Text>
              </View>
            </View>
            <Text style={styles.timeSep}>→</Text>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>End</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeValue}>{endTime}</Text>
              </View>
            </View>
          </View>
          <View style={styles.hoursSummary}>
            <Text style={styles.hoursText}>📊 Total: 9 hours/day</Text>
          </View>
        </View>

        {/* Service Range */}
        <Text style={styles.sectionLabel}>SERVICE RANGE</Text>
        <View style={styles.rangeCard}>
          <Text style={styles.rangeTitle}>Kitni door tak jaa sakte hain?</Text>
          <View style={styles.rangeRow}>
            {["5", "10", "15", "25", "50"].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.rangeChip,
                  range === r && styles.rangeChipActive,
                ]}
                onPress={() => setRange(r)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.rangeText,
                    range === r && styles.rangeTextActive,
                  ]}
                >
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Auto Accept */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.prefCard}>
          <View style={styles.prefRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefTitle}>Auto-Accept Bookings</Text>
              <Text style={styles.prefSub}>
                Nai bookings automatically qabool ho jayengi
              </Text>
            </View>
            <Switch
              value={autoAccept}
              onValueChange={setAutoAccept}
              trackColor={{ false: Colors.border, true: Colors.goldPrimary }}
              thumbColor={autoAccept ? Colors.charcoalDeep : Colors.textMuted}
            />
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Changes ✓</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.whiteSoft },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: Colors.whitePure,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.charcoalDeep, fontSize: 22, fontWeight: "800" },
  headerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  content: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    color: Colors.goldPrimary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 20,
  },
  masterCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.charcoalDeep,
    borderRadius: Radius.xl,
    padding: 20,
    marginTop: 16,
    ...Shadows.darkHeader,
  },
  masterTitle: {
    color: Colors.goldPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  masterSub: { color: Colors.textMuted, fontSize: 12 },
  daysCard: {
    backgroundColor: Colors.whitePure,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  daysRow: { flexDirection: "row", gap: 6 },
  dayChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: Colors.whiteSoft,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  dayChipActive: {
    backgroundColor: Colors.goldPrimary,
    borderColor: Colors.goldPrimary,
  },
  dayText: { color: Colors.charcoalLight, fontSize: 12, fontWeight: "700" },
  dayTextActive: { color: Colors.charcoalDeep },
  daysInfo: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
  hoursCard: {
    backgroundColor: Colors.whitePure,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  timeBlock: { flex: 1 },
  timeLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  timeBox: {
    backgroundColor: Colors.whiteSoft,
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  timeValue: { color: Colors.charcoalDeep, fontSize: 16, fontWeight: "700" },
  timeSep: {
    color: Colors.goldPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  hoursSummary: {
    marginTop: 12,
    backgroundColor: `${Colors.goldPrimary}10`,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  hoursText: { color: Colors.goldPrimary, fontSize: 13, fontWeight: "600" },
  rangeCard: {
    backgroundColor: Colors.whitePure,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  rangeTitle: {
    color: Colors.charcoalDeep,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  rangeRow: { flexDirection: "row", gap: 8 },
  rangeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: Colors.whiteSoft,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  rangeChipActive: {
    backgroundColor: Colors.goldPrimary,
    borderColor: Colors.goldPrimary,
  },
  rangeText: { color: Colors.charcoalLight, fontSize: 13, fontWeight: "700" },
  rangeTextActive: { color: Colors.charcoalDeep },
  prefCard: {
    backgroundColor: Colors.whitePure,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  prefRow: { flexDirection: "row", alignItems: "center" },
  prefTitle: {
    color: Colors.charcoalDeep,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  prefSub: { color: Colors.textMuted, fontSize: 12 },
  saveBtn: {
    backgroundColor: Colors.goldPrimary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    ...Shadows.goldFloat,
  },
  saveBtnText: { color: Colors.charcoalDeep, fontSize: 16, fontWeight: "800" },
});

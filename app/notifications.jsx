import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Animated, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, Bell, Star, ArrowLeft } from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { useRouter } from "expo-router";
import { API_URL } from "../constants/config";

const TYPE_LABELS = {
  booking: "Booking Confirmed",
  reminder: "Upcoming Visit",
  rating: "Rate Your Experience",
  status: "Status Update",
};

const NotificationIcon = ({ type }) => {
  const config = {
    booking: { icon: Check, bg: COLORS.success },
    reminder: { icon: Bell, bg: COLORS.greenPrimary },
    rating: { icon: Star, bg: COLORS.grayMatte },
  };

  const Icon = config[type].icon;

  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: config[type].bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={20} color="#fff" strokeWidth={2.5} />
    </View>
  );
};

const AnimatedItem = ({
  item,
  index,
}) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          marginHorizontal: 20,
          marginBottom: 12,
          padding: 14,
          borderRadius: 12,
          backgroundColor: item.unread ? "#FFFFFF" : COLORS.backgroundBase,
          borderWidth: item.unread ? 1 : 0,
          borderColor: COLORS.borderLight,
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <NotificationIcon type={item.type} />

          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", fontSize: 14, color: COLORS.textPrimary }}>
              {item.title}
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>{item.body}</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
              {item.timestamp}
            </Text>
            {item.unread && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: COLORS.greenPrimary,
                  marginTop: 6,
                }}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function NotificationScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/notifications?limit=30`);
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Notifications unavailable");
        }

        const mapped = (data.notifications || []).map((item, index) => ({
          id: item.id || `${index}`,
          type: item.type || "booking",
          title: item.title || TYPE_LABELS[item.type] || "Notification",
          body: item.message || item.body || "System update",
          timestamp: item.sent_at ? new Date(item.sent_at).toLocaleString() : "Just now",
          unread: item.read !== true,
        }));

        setNotifications(mapped);
      } catch (err) {
        setError(err.message || "Notifications load nahi ho saki");
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.backgroundBase }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
            <ArrowLeft color={COLORS.textPrimary} size={24} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: COLORS.textPrimary }}>Notifications</Text>
          <Text style={{ color: COLORS.textSecondary }}>
            {unreadCount} unread notifications
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={COLORS.greenPrimary} />
          <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>Notifications load ho rahi hain...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ textAlign: "center", color: COLORS.textPrimary, fontWeight: "600" }}>Kuch masla hua</Text>
          <Text style={{ textAlign: "center", color: COLORS.textSecondary, marginTop: 6 }}>{error}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ textAlign: "center", color: COLORS.textPrimary, fontWeight: "600" }}>No notifications yet</Text>
          <Text style={{ textAlign: "center", color: COLORS.textSecondary, marginTop: 6 }}>Booking aur reminders yahan live appear hongi.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item, index }) => (
            <AnimatedItem item={item} index={index} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

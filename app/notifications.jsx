import React, { useEffect, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, Bell, Star, ArrowLeft } from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { useRouter } from "expo-router";

const mockNotifications = [
  {
    id: "1",
    type: "booking",
    title: "Booking Confirmed",
    body: "Ali AC Services kal 10:00 AM par aa rahe hain! Code: KRG-4751",
    timestamp: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    type: "reminder",
    title: "Upcoming Visit",
    body: "Ali AC Services ki visit 10:00 AM par hai.",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    type: "rating",
    title: "Rate Your Experience",
    body: "Service complete ho gayi. Feedback dein.",
    timestamp: "Yesterday",
    unread: false,
  },
];

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
  const unreadCount = mockNotifications.filter((n) => n.unread).length;

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

      <FlatList
        data={mockNotifications}
        renderItem={({ item, index }) => (
          <AnimatedItem item={item} index={index} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

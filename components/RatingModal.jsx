import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import { Star } from "lucide-react-native";
import { COLORS } from "../constants/theme";

const { height } = Dimensions.get("window");

export default function RatingModal({
  visible,
  onClose,
}) {
  const [rating, setRating] = useState(4);
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((i) => {
      const scale = useRef(new Animated.Value(1)).current;

      const animate = () => {
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.3,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      };

      return (
        <TouchableOpacity
          key={i}
          onPress={() => {
            setRating(i);
            animate();
          }}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Star
              size={40}
              color={i <= rating ? COLORS.goldPrimary : COLORS.borderLight}
              fill={i <= rating ? COLORS.goldPrimary : "none"}
            />
          </Animated.View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <Animated.View
          style={{
            height: "70%",
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            transform: [{ translateY }],
          }}
        >
          <View style={{ alignItems: "center" }}>
            {/* Avatar */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 3,
                borderColor: COLORS.goldPrimary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>AA</Text>
            </View>

            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              Ali AC Services ko rate karein
            </Text>

            <Text style={{ color: COLORS.textSecondary, marginBottom: 20 }}>
              AC Technician â€¢ 13 September, 10:00 AM
            </Text>

            {/* Stars */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {renderStars()}
            </View>

            <Text style={{ color: COLORS.goldPrimary, marginTop: 10 }}>
              {rating} stars
            </Text>

            {/* Input */}
            <TextInput
              placeholder="Kuch kehna chahte hain?"
              multiline
              style={{
                width: "100%",
                height: 80,
                borderWidth: 1,
                borderColor: COLORS.borderLight,
                borderRadius: 10,
                marginTop: 20,
                padding: 10,
              }}
            />

            {/* Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: COLORS.goldPrimary,
                width: "100%",
                padding: 14,
                borderRadius: 10,
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "600" }}>Rating Submit Karo</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

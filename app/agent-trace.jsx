import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  MapPin,
  Trophy,
  Calendar,
  Bell,
  ChevronDown,
  Zap,
  Search,
  Database,
  Brain,
  Cpu,
  MessageCircle,
  CheckCircle2,
} from "lucide-react-native";

//        Types                                                                                                                                       

type AgentStatus = "pending" | "active" | "done";

type AgentTool = {
  icon: React.FC<{ size: number; color: string }>;
  name: string;
  duration: string;
};

type AgentStep = {
  id: number;
  name: string;
  sub: string;
  icon: React.FC<{ size: number; color: string }>;
  duration: string;
  input: string;
  output: string;
  tools: AgentTool[];
};

//        Data                                                                                                                                           

const AGENTS: AgentStep[] = [
  {
    id: 1,
    name: "INTENT PARSER",
    sub: "Samajh liya",
    icon: MessageCircle,
    duration: "0.8s",
    input:
      'User request: "Need electrician for home wiring\nin Andheri West, Mumbai"',
    output:
      "Intent: Service Booking\nService: Electrician\nLocation: Andheri West, Mumbai\nPriority: High",
    tools: [
      { icon: Zap, name: "Gemini API", duration: "0.3s" },
      { icon: MapPin, name: "Google Geocoding", duration: "0.2s" },
    ],
  },
  {
    id: 2,
    name: "PROVIDER DISCOVERY",
    sub: "Dhundh raha hai",
    icon: Search,
    duration: "0.9s",
    input: "Service: Electrician\nLocation: Andheri West, Mumbai\nRadius: 5km",
    output: "Found 12 providers\nTop 3 matched\nDistance calculated for all",
    tools: [
      { icon: Database, name: "PostgreSQL Query", duration: "0.4s" },
      { icon: MapPin, name: "Distance Matrix", duration: "0.3s" },
    ],
  },
  {
    id: 3,
    name: "MATCHING & RANKING",
    sub: "Sab check kar liya",
    icon: Trophy,
    duration: "0.7s",
    input: "12 providers\nUser rating preference: 4.5+\nBudget:  500  1000",
    output:
      "Ranked providers:\n1. Rajesh Kumar (4.8& )\n2. Amit Sharma (4.6& )\n3. Suresh Patil (4.5& )",
    tools: [
      { icon: Trophy, name: "Scoring Algorithm", duration: "0.3s" },
      { icon: Brain, name: "Gemini Reasoning", duration: "0.2s" },
    ],
  },
  {
    id: 4,
    name: "BOOKING EXECUTOR",
    sub: "Booking ho gayi",
    icon: Calendar,
    duration: "0.5s",
    input: "Provider: Rajesh Kumar\nTime: Tomorrow 10 AM\nService: Home wiring",
    output:
      "Booking created: BK-20240913-0047\nNotification sent to provider\nConfirmation sent to user",
    tools: [
      { icon: Database, name: "Supabase Write", duration: "0.2s" },
      { icon: Bell, name: "FCM Notification", duration: "0.1s" },
    ],
  },
  {
    id: 5,
    name: "FOLLOW-UP SCHEDULER",
    sub: "Reminder set kar diya",
    icon: Bell,
    duration: "0.3s",
    input: "Booking ID: BK-20240913-0047\nFollow-up: 24 hours before",
    output:
      "Reminder scheduled\nQueue: BullMQ (Redis)\nTime: 2024-09-14 10:00 AM",
    tools: [{ icon: Cpu, name: "BullMQ (Redis)", duration: "0.2s" }],
  },
];

// Delays (ms): when each agent becomes active, and how long it runs
const ACTIVATE_AT = [0, 1000, 1950, 2750, 3350];
const COMPLETE_AFTER = [900, 950, 800, 600, 400];

//        Sub-components                                                                                                                       

/** Spinning arc shown while an agent is active */
const SpinningArc: React.FC = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[styles.spinArc, { transform: [{ rotate: spin }] }]}
    />
  );
};

/** Shimmer bar shown while agent is loading */
const ShimmerBar: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.shimmerWrap}>
      <Animated.View style={[styles.shimmerBar, { opacity }]} />
      <Animated.View
        style={[styles.shimmerBar, { opacity, marginTop: 8, width: "70%" }]}
      />
      <Animated.View
        style={[styles.shimmerBar, { opacity, marginTop: 8, width: "50%" }]}
      />
    </View>
  );
};

/** Status badge */
const StatusBadge: React.FC<{ status: AgentStatus }> = ({ status }) => {
  if (status === "done")
    return (
      <View style={[styles.badge, styles.badgeDone]}>
        <Check size={10} color="#4caf7a" />
        <Text style={[styles.badgeText, { color: "#4caf7a" }]}>Done</Text>
      </View>
    );
  if (status === "active")
    return (
      <View style={[styles.badge, styles.badgeActive]}>
        <SpinningArc />
        <Text style={[styles.badgeText, { color: "#c49a5a" }]}>Running</Text>
      </View>
    );
  return (
    <View style={[styles.badge, styles.badgePending]}>
      <Text style={[styles.badgeText, { color: "#666" }]}>Pending</Text>
    </View>
  );
};

/** Single agent block */
const AgentBlock: React.FC<{
  agent: AgentStep;
  status: AgentStatus;
}> = ({ agent, status }) => {
  const Icon = agent.icon;

  // Pulsing glow border when active
  const pulseAnim = useRef(new Animated.Value(0)).current;
  // Content fade-in when done
  const contentAnim = useRef(new Animated.Value(0)).current;
  // Check bounce when done
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === "active") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 750,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(0);
    }

    if (status === "done") {
      Animated.sequence([
        Animated.spring(checkScale, {
          toValue: 1.3,
          useNativeDriver: true,
          speed: 30,
        }),
        Animated.spring(checkScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
        }),
      ]).start();
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(196,154,90,0)", "rgba(196,154,90,0.4)"],
  });

  return (
    <Animated.View
      style={[styles.agentBlock, status === "active" && { borderColor }]}
    >
      {/* Left gold accent bar */}
      <View style={styles.accentBar} />

      {/* Header */}
      <View style={styles.blockHeader}>
        <View style={styles.iconCircle}>
          <Icon size={18} color="#c49a5a" />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.agentLabel}>
            AGENT {agent.id}    {agent.name}
          </Text>
          <Text style={styles.agentSub}>{agent.sub}</Text>
        </View>
        <View style={styles.agentRight}>
          <Text style={styles.agentDuration}>
            {status === "pending" ? "  " : agent.duration}
          </Text>
          <Animated.View
            style={
              status === "done"
                ? { transform: [{ scale: checkScale }] }
                : undefined
            }
          >
            <StatusBadge status={status} />
          </Animated.View>
        </View>
      </View>

      {/* Body */}
      {(status === "active" || status === "done") && (
        <View style={styles.blockBody}>
          {status === "active" ? (
            <ShimmerBar />
          ) : (
            <Animated.View style={{ opacity: contentAnim }}>
              {/* Input */}
              <Text style={styles.ioLabel}>INPUT</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>{agent.input}</Text>
              </View>

              {/* Output */}
              <Text style={[styles.ioLabel, { marginTop: 10 }]}>OUTPUT</Text>
              <View style={[styles.codeBlock, styles.outputBlock]}>
                <Text style={styles.codeText}>{agent.output}</Text>
              </View>

              {/* Tools */}
              {agent.tools.length > 0 && (
                <>
                  <Text style={[styles.ioLabel, { marginTop: 10 }]}>
                    TOOLS CALLED
                  </Text>
                  <View style={styles.toolsRow}>
                    {agent.tools.map((tool, i) => {
                      const ToolIcon = tool.icon;
                      return (
                        <View key={i} style={styles.toolPill}>
                          <ToolIcon size={13} color="#c49a5a" />
                          <Text style={styles.toolName}>{tool.name}</Text>
                          <Text style={styles.toolDur}>   {tool.duration}</Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </Animated.View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

/** Connector between agents */
const Connector: React.FC<{ lit: boolean }> = ({ lit }) => {
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lit) {
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [lit]);

  const lineColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#3a3a3a", "#c49a5a"],
  });

  return (
    <View style={styles.connector}>
      <Animated.View
        style={[styles.connectorLine, { backgroundColor: lineColor }]}
      />
      <Animated.View
        style={[
          styles.connectorArrow,
          { borderTopColor: lineColor, borderLeftColor: lineColor },
        ]}
      />
    </View>
  );
};

/** Summary card */
const SummaryCard: React.FC = () => {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.summaryCard,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={styles.summaryHeader}>
        <CheckCircle2 size={20} color="#1a1a1a" />
        <Text style={styles.summaryTitle}>Pipeline Complete S </Text>
      </View>
      <Text style={styles.summaryStats}>
        5 Agents {"  |  "} 6 Tool Calls {"  |  "} 3.2 Seconds {"  |  "} 0 Errors
      </Text>
      <TouchableOpacity style={styles.summaryBtn} activeOpacity={0.8}>
        <Text style={styles.summaryBtnText}>Booking Dekhein</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

//        Main Screen                                                                                                                             

export default function AgentTraceScreen() {
  const router = useRouter();
  const [statuses, setStatuses] = useState(
    AGENTS.map(() => "pending"),
  );
  const [connectorLit, setConnectorLit] = useState(
    Array(AGENTS.length - 1).fill(false),
  );
  const [showSummary, setShowSummary] = useState(false);
  const [agentsDone, setAgentsDone] = useState(0);
  const [totalTime, setTotalTime] = useState("  ");

  useEffect(() => {
    AGENTS.forEach((_, idx) => {
      // Activate
      setTimeout(() => {
        setStatuses((prev) => {
          const next = [...prev];
          next[idx] = "active";
          return next;
        });
      }, ACTIVATE_AT[idx]);

      // Complete
      setTimeout(() => {
        setStatuses((prev) => {
          const next = [...prev];
          next[idx] = "done";
          return next;
        });
        setAgentsDone(idx + 1);

        // Light up connector
        if (idx < AGENTS.length - 1) {
          setConnectorLit((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        }

        // Show summary after last agent
        if (idx === AGENTS.length - 1) {
          setTimeout(() => {
            setTotalTime("3.2s");
            setShowSummary(true);
          }, 500);
        }
      }, ACTIVATE_AT[idx] + COMPLETE_AFTER[idx]);
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/*      Header      */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#c5c0b8" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KARIGAR Agent Trace</Text>
        <View style={styles.bookingPill}>
          <Text style={styles.bookingPillText}>BK-20240913-0047</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/*      Session Info Bar      */}
        <View style={styles.sessionBar}>
          <View style={styles.sessionItem}>
            <Text style={styles.sessionMono}>sess_abc123</Text>
          </View>
          <View style={styles.sessionSep} />
          <View style={styles.sessionItem}>
            <Text style={styles.sessionLabel}>Total: </Text>
            <Text style={styles.sessionVal}>{totalTime}</Text>
          </View>
          <View style={styles.sessionSep} />
          <View style={styles.sessionItem}>
            <Text style={styles.sessionLabel}>Agents: </Text>
            <Text style={styles.sessionVal}>{agentsDone}/5</Text>
          </View>
          <View style={styles.sessionSep} />
          <View style={styles.sessionItem}>
            <Text style={styles.sessionLabel}>Errors: </Text>
            <Text style={[styles.sessionVal, { color: "#4caf7a" }]}>0</Text>
          </View>
        </View>

        {/*      Agent Pipeline      */}
        {AGENTS.map((agent, idx) => (
          <View key={agent.id}>
            <AgentBlock agent={agent} status={statuses[idx]} />
            {idx < AGENTS.length - 1 && <Connector lit={connectorLit[idx]} />}
          </View>
        ))}

        {/*      Summary      */}
        {showSummary && <SummaryCard />}
      </ScrollView>
    </SafeAreaView>
  );
}

//        Styles                                                                                                                                       

const GOLD = "#c49a5a";
const GOLD_LIGHT = "#d4b47a";
const CHARCOAL_DEEP = "#1a1a1a";
const CHARCOAL_MID = "#252525";
const CHARCOAL_LIGHT = "#2e2e2e";
const BORDER = "#333";
const TEXT_ON_DARK = "#f0ede8";
const TEXT_MUTED = "#888";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CHARCOAL_DEEP,
  },

  //        Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    backgroundColor: CHARCOAL_DEEP,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    fontSize: 13,
    color: "#c5c0b8",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_ON_DARK,
    letterSpacing: 0.3,
  },
  bookingPill: {
    backgroundColor: GOLD,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bookingPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: CHARCOAL_DEEP,
    letterSpacing: 0.5,
  },

  //        Scroll
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 180,
  },

  //        Session Bar
  sessionBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CHARCOAL_MID,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  sessionItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  sessionMono: {
    fontSize: 10,
    fontFamily: "monospace",
    color: TEXT_MUTED,
  },
  sessionLabel: {
    fontSize: 10,
    color: TEXT_MUTED,
  },
  sessionVal: {
    fontSize: 10,
    fontWeight: "600",
    color: GOLD,
  },
  sessionSep: {
    width: 1,
    height: 16,
    backgroundColor: "#3a3a3a",
  },

  //        Agent Block
  agentBlock: {
    backgroundColor: CHARCOAL_LIGHT,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 0,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: GOLD,
    zIndex: 1,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 18,
    paddingRight: 14,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#3a2a1a",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  titleWrap: {
    flex: 1,
  },
  agentLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: GOLD,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    lineHeight: 14,
  },
  agentSub: {
    fontSize: 12,
    color: "#a0997c",
    marginTop: 2,
  },
  agentRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  agentDuration: {
    fontSize: 15,
    fontWeight: "700",
    color: GOLD,
  },

  //        Badges
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeDone: {
    backgroundColor: "rgba(46,125,82,0.2)",
  },
  badgeActive: {
    backgroundColor: "rgba(196,154,90,0.15)",
  },
  badgePending: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  spinArc: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderTopColor: GOLD,
    borderRightColor: GOLD,
    borderBottomColor: GOLD,
    borderLeftColor: "transparent",
  },

  //        Block Body
  blockBody: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingLeft: 18,
    paddingRight: 14,
    paddingVertical: 12,
  },

  //        Shimmer
  shimmerWrap: {
    paddingVertical: 4,
  },
  shimmerBar: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "#3a3622",
    width: "100%",
  },

  //        IO blocks
  ioLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  codeBlock: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  outputBlock: {
    borderLeftWidth: 2,
    borderLeftColor: GOLD,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "rgba(240,237,232,0.85)",
    lineHeight: 18,
  },

  //        Tools
  toolsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  toolPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#303030",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toolName: {
    fontSize: 10,
    color: GOLD,
  },
  toolDur: {
    fontSize: 10,
    color: TEXT_MUTED,
  },

  //        Connector
  connector: {
    alignItems: "center",
    paddingVertical: 4,
  },
  connectorLine: {
    width: 2,
    height: 14,
    backgroundColor: "#3a3a3a",
  },
  connectorArrow: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: "#3a3a3a",
    borderLeftColor: "#3a3a3a",
    transform: [{ rotate: "135deg" }],
    marginTop: -2,
  },

  //        Summary Card
  summaryCard: {
    marginTop: 16,
    backgroundColor: GOLD,
    borderRadius: 16,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: CHARCOAL_DEEP,
  },
  summaryStats: {
    fontSize: 11,
    color: "#3a2a10",
    marginBottom: 14,
  },
  summaryBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  summaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: CHARCOAL_DEEP,
  },
});

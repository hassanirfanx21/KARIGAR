const fs = require('fs');

// --- UPDATE booking-detail.jsx ---
let bd = fs.readFileSync('app/(customer)/booking-detail.jsx', 'utf8');

bd = bd.replace(
  "import { useRouter } from 'expo-router';",
  "import { useRouter, useLocalSearchParams } from 'expo-router';"
);

bd = bd.replace(
  "  const [agentExpanded, setAgentExpanded] = useState(false);",
  "  const { bookingId, workerName, slot, location, confirmCode } = useLocalSearchParams();\n  const [agentExpanded, setAgentExpanded] = useState(false);"
);

bd = bd.replace(
  "{ icon: '📅', label: 'Tarikh', value: 'Jumarat, 13 September 2024' },",
  "{ icon: '📅', label: 'Tarikh', value: slot || 'Jumarat, 13 September 2024' },"
);

bd = bd.replace(
  "{ icon: '📍', label: 'Jagah', value: 'G-13, Islamabad' },",
  "{ icon: '📍', label: 'Jagah', value: location || 'G-13, Islamabad' },"
);

bd = bd.replace(
  "{ icon: '🔖', label: 'Booking ID', value: 'BK-20240913-0047', mono: true },",
  "{ icon: '🔖', label: 'Booking ID', value: bookingId || 'BK-20240913-0047', mono: true },"
);

bd = bd.replace(
  "{ icon: '🔑', label: 'Confirm Code', value: 'KRG-4751', gold: true },",
  "{ icon: '🔑', label: 'Confirm Code', value: confirmCode || 'KRG-4751', gold: true },"
);

bd = bd.replace(
  "<Text style={styles.heroName}>Ali AC Services</Text>",
  "<Text style={styles.heroName}>{workerName || 'Ali AC Services'}</Text>"
);

fs.writeFileSync('app/(customer)/booking-detail.jsx', bd);

// --- UPDATE agent-trace.jsx ---
let at = fs.readFileSync('app/agent-trace.jsx', 'utf8');

if (!at.includes('useLocalSearchParams')) {
  at = at.replace(
    "import { useRouter } from \"expo-router\";",
    "import { useRouter, useLocalSearchParams } from \"expo-router\";"
  );
}

at = at.replace(
  "  const [statuses, setStatuses] = useState(",
  "  const params = useLocalSearchParams();\n  const bookingId = params.bookingId || 'BK-20240913-0047';\n  const [sessId] = useState('sess_' + Math.random().toString(36).substring(2, 8));\n  const [statuses, setStatuses] = useState("
);

at = at.replace(
  "<Text style={styles.bookingPillText}>BK-20240913-0047</Text>",
  "<Text style={styles.bookingPillText}>{bookingId}</Text>"
);

at = at.replace(
  "<Text style={styles.sessionMono}>sess_abc123</Text>",
  "<Text style={styles.sessionMono}>{sessId}</Text>"
);

fs.writeFileSync('app/agent-trace.jsx', at);


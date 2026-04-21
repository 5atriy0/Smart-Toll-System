export const MOCK_TRANSACTIONS = [
  { id: 'TX-001', time: '10:45:22', rfid: '04-89-AB-CD', plate: 'B 1234 XYZ', status: 'Granted', loc: 'Gate A' },
  { id: 'TX-002', time: '10:42:15', rfid: 'A1-B2-C3-D4', plate: 'D 5678 G', status: 'Granted', loc: 'Gate A' },
  { id: 'TX-003', time: '10:38:05', rfid: 'FF-EE-DD-CC', plate: 'UNKNOWN', status: 'Denied', loc: 'Gate A' },
  { id: 'TX-004', time: '10:30:11', rfid: '12-34-56-78', plate: 'B 9999 AA', status: 'Granted', loc: 'Gate B' },
]

export const MOCK_USERS = [
  { name: 'John Doe', rfid: '04-89-AB-CD', balance: 'Rp 150.000', status: 'Active' },
  { name: 'Jane Smith', rfid: '12-34-56-78', balance: 'Rp 50.000', status: 'Active' },
  { name: 'Michael C', rfid: 'FF-EE-DD-CC', balance: 'Rp 0', status: 'Suspended' },
]

export const MOCK_ANALYTICS_HOURLY = [
  { name: '08:00', volume: 120 },
  { name: '09:00', volume: 200 },
  { name: '10:00', volume: 150 },
  { name: '11:00', volume: 80 },
  { name: '12:00', volume: 90 },
]

export const MOCK_ANALYTICS_RATIO = [
  { name: 'Valid', value: 85, fill: 'hsl(154, 61%, 43%)' },
  { name: 'Invalid', value: 15, fill: 'hsl(0, 84%, 60%)' },
]

export const MOCK_REVENUE = [
  { name: 'Mon', revenue: 1200000 },
  { name: 'Tue', revenue: 1500000 },
  { name: 'Wed', revenue: 1400000 },
  { name: 'Thu', revenue: 1800000 },
  { name: 'Fri', revenue: 2000000 },
]

export const MOCK_VEHICLES_IN_OUT = [
  { name: 'Mon', in: 1200, out: 1150 },
  { name: 'Tue', in: 1500, out: 1420 },
  { name: 'Wed', in: 1400, out: 1450 },
  { name: 'Thu', in: 1800, out: 1750 },
  { name: 'Fri', in: 2000, out: 1950 },
  { name: 'Sat', in: 2200, out: 2100 },
  { name: 'Sun', in: 2100, out: 2150 },
];

export const MOCK_VEHICLES_INSIDE = [
  { time: '00:00', count: 120 },
  { time: '04:00', count: 80 },
  { time: '08:00', count: 450 },
  { time: '12:00', count: 520 },
  { time: '16:00', count: 680 },
  { time: '20:00', count: 310 },
];

export const MOCK_AVG_SPEED = [
  { name: 'Mon', speed: 85 },
  { name: 'Tue', speed: 82 },
  { name: 'Wed', speed: 84 },
  { name: 'Thu', speed: 79 },
  { name: 'Fri', speed: 75 },
  { name: 'Sat', speed: 90 },
  { name: 'Sun', speed: 92 },
];

export const MOCK_TRAVEL_TIME = [
  { name: 'Mon', time: 45 },
  { name: 'Tue', time: 48 },
  { name: 'Wed', time: 46 },
  { name: 'Thu', time: 52 },
  { name: 'Fri', time: 58 },
  { name: 'Sat', time: 40 },
  { name: 'Sun', time: 38 },
];

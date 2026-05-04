export const MOCK_TRANSACTIONS = [
  { id: 'TX-001', time: '10:45:22', rfid: '04-89-AB-CD', plate: 'B 1234 XYZ', status: 'Granted', loc: 'Gerbang A' },
  { id: 'TX-002', time: '10:42:15', rfid: 'A1-B2-C3-D4', plate: 'D 5678 G', status: 'Granted', loc: 'Gerbang A' },
  { id: 'TX-003', time: '10:38:05', rfid: 'FF-EE-DD-CC', plate: 'TIDAK DIKETAHUI', status: 'Denied', loc: 'Gerbang A' },
  { id: 'TX-004', time: '10:30:11', rfid: '12-34-56-78', plate: 'B 9999 AA', status: 'Granted', loc: 'Gerbang B' },
]

export const MOCK_USERS = [
  { name: 'John Doe', plateNumber: 'B 1234 XYZ', rfid: '04-89-AB-CD', balance: 'Rp 150.000', status: 'Active', role: 'Admin' },
  { name: 'Jane Smith', plateNumber: 'D 5678 G', rfid: '12-34-56-78', balance: 'Rp 50.000', status: 'Active', role: 'User' },
  { name: 'Michael C', plateNumber: 'TIDAK DIKETAHUI', rfid: 'FF-EE-DD-CC', balance: 'Rp 0', status: 'Suspended', role: 'User' },
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
  { name: 'Tidak Valid', value: 15, fill: 'hsl(0, 84%, 60%)' },
]

export const MOCK_SYSTEM_ERRORS = [
  { name: 'Saldo Tidak Cukup', value: 45, fill: 'hsl(0, 84%, 60%)' },
  { name: 'Kartu Tidak Terdaftar', value: 35, fill: 'hsl(35, 100%, 50%)' },
  { name: 'Timeout Sensor', value: 15, fill: 'hsl(212, 100%, 48%)' },
  { name: 'Kesalahan Perangkat', value: 5, fill: 'hsl(280, 100%, 60%)' },
]

export const MOCK_REVENUE = [
  { name: 'Sen', revenue: 1200000 },
  { name: 'Sel', revenue: 1500000 },
  { name: 'Rab', revenue: 1400000 },
  { name: 'Kam', revenue: 1800000 },
  { name: 'Jum', revenue: 2000000 },
]

export const MOCK_VEHICLES_IN_OUT = [
  { name: 'Sen', in: 1200, out: 1150 },
  { name: 'Sel', in: 1500, out: 1420 },
  { name: 'Rab', in: 1400, out: 1450 },
  { name: 'Kam', in: 1800, out: 1750 },
  { name: 'Jum', in: 2000, out: 1950 },
  { name: 'Sab', in: 2200, out: 2100 },
  { name: 'Min', in: 2100, out: 2150 },
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
  { name: 'Sen', speed: 85 },
  { name: 'Sel', speed: 82 },
  { name: 'Rab', speed: 84 },
  { name: 'Kam', speed: 79 },
  { name: 'Jum', speed: 75 },
  { name: 'Sab', speed: 90 },
  { name: 'Min', speed: 92 },
];

export const MOCK_TRAVEL_TIME = [
  { name: 'Sen', time: 45 },
  { name: 'Sel', time: 48 },
  { name: 'Rab', time: 46 },
  { name: 'Kam', time: 52 },
  { name: 'Jum', time: 58 },
  { name: 'Sab', time: 40 },
  { name: 'Min', time: 38 },
];

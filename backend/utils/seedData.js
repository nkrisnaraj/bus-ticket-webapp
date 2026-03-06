/**
 * QBus Data Seeder
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds the database with:
 *   • 1 test user  (test@qbus.com / Test@123)
 *   • 10 fleet buses across 6 popular Sri Lankan routes
 *   • ~50 schedules  (each bus × 5 upcoming days, some with 2 trips/day)
 *
 * Safe to re-run — skips anything that already exists (idempotent).
 *
 * Usage:
 *   node utils/seedData.js          ← seed
 *   node utils/seedData.js --wipe   ← wipe Fleet + Schedules then re-seed
 *                                     (user & admin are never deleted)
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User     = require('../models/User');
const Fleet    = require('../models/Fleet');
const Schedule = require('../models/Schedule');

// ── helpers ───────────────────────────────────────────────────────────────────

/** Return 'YYYY-MM-DD' for today + offsetDays */
const dateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

/** If arrivalTime < departureTime the bus arrives on the NEXT calendar day */
const arrDate = (depDate, depTime, arrTime) => {
  if (arrTime >= depTime) return depDate;
  const d = new Date(depDate + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// ── seed definitions ──────────────────────────────────────────────────────────

const TEST_USER = {
  name:     'Test User',
  email:    'test@qbus.com',
  password: 'Test@123',   // pre-save hook bcrypt-hashes this automatically
  role:     'user',
};

/**
 * 10 buses across the 6 popular routes shown on the homepage.
 * busNumber is kept short so it fits the table column.
 */
const BUSES = [
  // ── Colombo ↔ Jaffna ────────────────────────────────────────────────────
  { busNumber: 'NB-1001', type: 'Luxury',     source: 'Colombo', destination: 'Jaffna',        routeNumber: '15',  ownerMobile: '0761000001', driverMobile: '0761100001', conductorMobile: '0761200001' },
  { busNumber: 'NB-1002', type: 'AC',         source: 'Colombo', destination: 'Jaffna',        routeNumber: '15',  ownerMobile: '0761000002', driverMobile: '0761100002', conductorMobile: '0761200002' },

  // ── Colombo ↔ Kandy ─────────────────────────────────────────────────────
  { busNumber: 'NB-1003', type: 'AC',         source: 'Colombo', destination: 'Kandy',         routeNumber: '1',   ownerMobile: '0761000003', driverMobile: '0761100003', conductorMobile: '0761200003' },
  { busNumber: 'NB-1004', type: 'Non-AC',     source: 'Colombo', destination: 'Kandy',         routeNumber: '1',   ownerMobile: '0761000004', driverMobile: '0761100004', conductorMobile: '0761200004' },

  // ── Colombo ↔ Galle ─────────────────────────────────────────────────────
  { busNumber: 'NB-1005', type: 'AC',         source: 'Colombo', destination: 'Galle',         routeNumber: '2',   ownerMobile: '0761000005', driverMobile: '0761100005', conductorMobile: '0761200005' },
  { busNumber: 'NB-1006', type: 'Non-AC',     source: 'Colombo', destination: 'Galle',         routeNumber: '2',   ownerMobile: '0761000006', driverMobile: '0761100006', conductorMobile: '0761200006' },

  // ── Colombo ↔ Nuwara Eliya ───────────────────────────────────────────────
  { busNumber: 'NB-1007', type: 'Semi-Luxury', source: 'Colombo', destination: 'Nuwara Eliya', routeNumber: '98',  ownerMobile: '0761000007', driverMobile: '0761100007', conductorMobile: '0761200007' },

  // ── Kandy ↔ Anuradhapura ─────────────────────────────────────────────────
  { busNumber: 'NB-1008', type: 'Non-AC',     source: 'Kandy',   destination: 'Anuradhapura',  routeNumber: '56',  ownerMobile: '0761000008', driverMobile: '0761100008', conductorMobile: '0761200008' },

  // ── Colombo ↔ Trincomalee ────────────────────────────────────────────────
  { busNumber: 'NB-1009', type: 'Luxury',     source: 'Colombo', destination: 'Trincomalee',   routeNumber: '72',  ownerMobile: '0761000009', driverMobile: '0761100009', conductorMobile: '0761200009' },
  { busNumber: 'NB-1010', type: 'AC',         source: 'Colombo', destination: 'Trincomalee',   routeNumber: '72',  ownerMobile: '0761000010', driverMobile: '0761100010', conductorMobile: '0761200010' },
];

/**
 * Trip templates per busNumber.
 * Each entry is { depTime, arrTime, price }.
 * Some routes get 2 trips/day (morning + evening).
 */
const TRIP_TEMPLATES = {
  // Colombo → Jaffna   7h 30m
  'NB-1001': [{ dep: '06:00', arr: '13:30', price: 2000 }],
  'NB-1002': [{ dep: '14:00', arr: '21:30', price: 1500 }],

  // Colombo → Kandy   2h 45m  (2 trips per day)
  'NB-1003': [{ dep: '07:00', arr: '09:45', price: 700 }, { dep: '15:30', arr: '18:15', price: 700 }],
  'NB-1004': [{ dep: '10:00', arr: '12:45', price: 400 }, { dep: '17:00', arr: '19:45', price: 400 }],

  // Colombo → Galle   2h 30m  (2 trips per day)
  'NB-1005': [{ dep: '08:00', arr: '10:30', price: 650 }, { dep: '16:00', arr: '18:30', price: 650 }],
  'NB-1006': [{ dep: '09:30', arr: '12:00', price: 350 }, { dep: '18:00', arr: '20:30', price: 350 }],

  // Colombo → Nuwara Eliya   4h 00m
  'NB-1007': [{ dep: '07:30', arr: '11:30', price: 950 }, { dep: '14:00', arr: '18:00', price: 950 }],

  // Kandy → Anuradhapura   3h 30m
  'NB-1008': [{ dep: '09:00', arr: '12:30', price: 750 }, { dep: '14:00', arr: '17:30', price: 750 }],

  // Colombo → Trincomalee   6h 00m
  'NB-1009': [{ dep: '07:00', arr: '13:00', price: 1500 }],
  // Night bus — arrives next day
  'NB-1010': [{ dep: '21:00', arr: '03:00', price: 1200 }],
};

// ── main ──────────────────────────────────────────────────────────────────────

async function seed() {
  const WIPE = process.argv.includes('--wipe');

  console.log('\n' + '═'.repeat(58));
  console.log('  🚌  QBus Data Seeder');
  console.log('═'.repeat(58));

  await mongoose.connect(process.env.MONGO_URI, { dbName: 'QBus' });
  console.log('  ✅  MongoDB connected\n');

  // ── optional wipe ─────────────────────────────────────────────────────────
  if (WIPE) {
    await Fleet.deleteMany({ busNumber: { $in: BUSES.map(b => b.busNumber) } });
    const wipedBusNums = BUSES.map(b => b.busNumber);
    // also remove schedules for these buses (find by busNumber via Fleet)
    // Since we wiped the Fleet docs, we can't use busId; do a fresh delete by re-inserting
    await Schedule.deleteMany({ source: { $in: ['Colombo','Kandy'] } });
    console.log('  🗑   Wiped existing seed fleet & schedules');
  }

  // ── 1. Test user ──────────────────────────────────────────────────────────
  const existingUser = await User.findOne({ email: TEST_USER.email });
  if (existingUser) {
    console.log('  ⏭   Test user already exists — skipped');
  } else {
    await User.create(TEST_USER);
    console.log('  👤  Test user created');
    console.log(`       Email    : ${TEST_USER.email}`);
    console.log(`       Password : ${TEST_USER.password}`);
  }

  // ── 2. Fleet buses ────────────────────────────────────────────────────────
  let busesCreated = 0;
  const fleetMap = {};   // busNumber → _id

  for (const bus of BUSES) {
    const exists = await Fleet.findOne({ busNumber: bus.busNumber });
    if (exists) {
      fleetMap[bus.busNumber] = exists._id;
    } else {
      const created = await Fleet.create({ ...bus, totalSeats: 47 });
      fleetMap[bus.busNumber] = created._id;
      busesCreated++;
    }
  }

  console.log(`\n  🚌  Fleet: ${busesCreated} new bus(es) created (${BUSES.length - busesCreated} already existed)`);

  // ── 3. Schedules for the next 5 days ─────────────────────────────────────
  let schedsCreated = 0;
  const DAYS = 5;

  for (let day = 0; day < DAYS; day++) {
    const depDate = dateStr(day);

    for (const bus of BUSES) {
      const templates = TRIP_TEMPLATES[bus.busNumber] || [];
      const busId     = fleetMap[bus.busNumber];

      for (const t of templates) {
        const computedArrDate = arrDate(depDate, t.dep, t.arr);

        // Skip if this exact trip already exists
        const dup = await Schedule.findOne({
          busId,
          departureDate: depDate,
          departureTime: t.dep,
        });
        if (dup) continue;

        await Schedule.create({
          busId,
          source:        bus.source,
          destination:   bus.destination,
          departureDate: depDate,
          departureTime: t.dep,
          arrivalDate:   computedArrDate,
          arrivalTime:   t.arr,
          price:         t.price,
          totalSeats:    47,
          bookedSeats:   [],
          status:        'scheduled',
          isRecurring:   false,
        });
        schedsCreated++;
      }
    }
  }

  console.log(`  📅  Schedules: ${schedsCreated} new trip(s) created across ${DAYS} days\n`);

  // ── summary ───────────────────────────────────────────────────────────────
  console.log('  📊  Seed summary');
  console.log('  ─'.repeat(29));
  console.log(`  Total fleet  : ${await Fleet.countDocuments()} bus(es) in DB`);
  console.log(`  Total scheds : ${await Schedule.countDocuments()} schedule(s) in DB`);
  console.log(`  Total users  : ${await User.countDocuments()} user(s) in DB`);
  console.log('\n' + '═'.repeat(58));
  console.log('  ✅  Seeding complete!');
  console.log('  🔐  Test login: test@qbus.com  /  Test@123');
  console.log('  🔐  Admin    : admin@qbus.com  /  Admin@123  (if default)');
  console.log('═'.repeat(58) + '\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('\n❌  Seeder failed:', err.message);
  process.exit(1);
});

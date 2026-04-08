require('dotenv/config');

const { randomBytes, scryptSync } = require('node:crypto');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { PrismaClient, UserRole, Weekday } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set.');
}

const isRenderConnection = (value) =>
  value.includes('render.com') || value.includes('dpg-');

const toPoolConfig = (value) => {
  if (!isRenderConnection(value)) {
    return { connectionString: value };
  }

  const url = new URL(value);
  url.searchParams.delete('sslmode');

  return {
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: false,
    },
  };
};

const adapter = new PrismaPg(new Pool(toPoolConfig(connectionString)), {
  disposeExternalPool: true,
});
const prisma = new PrismaClient({ adapter });

const toDateOnly = (value) => new Date(`${value}T00:00:00.000Z`);
const hashPassword = (value) => {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(value, salt, 64).toString('hex');
  return `scrypt$${salt}$${key}`;
};

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gymhelper.local' },
    update: {
      name: 'Admin',
      role: UserRole.ADMIN,
      passwordHash: hashPassword('admin123'),
    },
    create: {
      name: 'Admin',
      email: 'admin@gymhelper.local',
      role: UserRole.ADMIN,
      passwordHash: hashPassword('admin123'),
    },
  });

  await prisma.planDay.deleteMany({
    where: { userId: admin.id },
  });
  await prisma.workoutDay.deleteMany({
    where: { userId: admin.id },
  });
  await prisma.nutritionDay.deleteMany({
    where: { userId: admin.id },
  });
  await prisma.restDay.deleteMany({
    where: { userId: admin.id },
  });

  await prisma.planDay.create({
    data: {
      userId: admin.id,
      weekday: Weekday.MON,
      exercises: {
        create: [
          {
            sortOrder: 1,
            name: 'Жим лежа',
            note: '4 подхода по 8 повторений',
          },
          {
            sortOrder: 2,
            name: 'Жим гантелей сидя',
            note: '3 подхода по 10 повторений',
          },
        ],
      },
    },
  });

  await prisma.planDay.create({
    data: {
      userId: admin.id,
      weekday: Weekday.WED,
      exercises: {
        create: [
          {
            sortOrder: 1,
            name: 'Приседания',
            note: '4 подхода по 6 повторений',
          },
          {
            sortOrder: 2,
            name: 'Выпады',
            note: '3 подхода на каждую ногу',
          },
        ],
      },
    },
  });

  await prisma.workoutDay.create({
    data: {
      userId: admin.id,
      date: toDateOnly('2026-04-07'),
      exercises: {
        create: [
          {
            sortOrder: 1,
            name: 'Жим лежа',
            sets: {
              create: [
                { sortOrder: 1, weight: 60, reps: 8 },
                { sortOrder: 2, weight: 60, reps: 8 },
                { sortOrder: 3, weight: 62.5, reps: 6 },
              ],
            },
          },
          {
            sortOrder: 2,
            name: 'Отжимания на брусьях',
            sets: {
              create: [
                { sortOrder: 1, reps: 12 },
                { sortOrder: 2, reps: 10 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.nutritionDay.create({
    data: {
      userId: admin.id,
      date: toDateOnly('2026-04-07'),
      meals: {
        create: [
          {
            sortOrder: 1,
            title: 'Овсянка с бананом',
            calories: 420,
            protein: 16,
            fat: 9,
            carbs: 68,
          },
          {
            sortOrder: 2,
            title: 'Курица с рисом',
            calories: 650,
            protein: 48,
            fat: 14,
            carbs: 78,
          },
        ],
      },
    },
  });

  await prisma.restDay.create({
    data: {
      userId: admin.id,
      date: toDateOnly('2026-04-07'),
      isRest: false,
      sleepHours: 7.5,
      note: 'Самочувствие хорошее, восстановление нормальное.',
    },
  });

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

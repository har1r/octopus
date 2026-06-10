// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { username: 'penginput', name: 'Staf Penginput', role: UserRole.STAF_PENGINPUT, email: 'penginput@architax.gov' },
    { username: 'peneliti', name: 'Staf Peneliti', role: UserRole.STAF_PENELITI, email: 'peneliti@architax.gov' },
    { username: 'pengarsip', name: 'Staf Pengarsip', role: UserRole.STAF_PENGARSIP, email: 'pengarsip@architax.gov' },
    { username: 'pengirim', name: 'Staf Pengirim', role: UserRole.STAF_PENGIRIM, email: 'pengirim@architax.gov' },
    { username: 'pemantau', name: 'Staf Pemantau', role: UserRole.STAF_PEMANTAU, email: 'pemantau@architax.gov' },
    { username: 'supervisor', name: 'Supervisor', role: UserRole.SUPERVISOR, email: 'supervisor@architax.gov' },
  ];

  const defaultPassword = 'P@ssword123!';
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

  for (const u of roles) {
    const existing = await prisma.user.findUnique({
      where: { username: u.username }
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          username: u.username,
          name: u.name,
          email: u.email,
          role: u.role,
          passwordHash,
          isActive: true
        }
      });
      console.log(`Created user: ${u.username}`);
    } else {
      console.log(`User already exists: ${u.username}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

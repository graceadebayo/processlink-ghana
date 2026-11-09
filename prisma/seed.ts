import { PrismaClient, Role, UserStatus, ProjectStatus, JobStatus, ExpenseCategory, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  await prisma.investorPayout.deleteMany(); await prisma.distribution.deleteMany(); await prisma.review.deleteMany();
  await prisma.payment.deleteMany(); await prisma.expense.deleteMany(); await prisma.job.deleteMany();
  await prisma.investment.deleteMany(); await prisma.operatorApplication.deleteMany(); await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany(); await prisma.passwordResetToken.deleteMany(); await prisma.session.deleteMany(); await prisma.equipment.deleteMany(); await prisma.user.deleteMany();
  const passwordHash = await bcrypt.hash('ProcessLink123!', 12);
  const createUser = (name: string, email: string, role: Role, status = UserStatus.VERIFIED, phone?: string) => prisma.user.create({ data: { name, email, role, status, phone, passwordHash } });
  const admin = await createUser('ProcessLink Admin', 'admin@processlink.gh', Role.ADMIN);
  const investors = await Promise.all([
    createUser('Ama Mensah', 'ama.investor@processlink.gh', Role.INVESTOR),
    createUser('Kojo Asare', 'kojo.investor@processlink.gh', Role.INVESTOR),
    createUser('Esi Boateng', 'esi.investor@processlink.gh', Role.INVESTOR),
  ]);
  const operators = await Promise.all([
    createUser('Kwame Owusu', 'kwame.operator@processlink.gh', Role.OPERATOR),
    createUser('Abena Frimpong', 'abena.operator@processlink.gh', Role.OPERATOR),
  ]);
  const customers = await Promise.all([
    createUser('Yaw Addo', 'yaw.customer@processlink.gh', Role.CUSTOMER),
    createUser('Akosua Nyarko', 'akosua.customer@processlink.gh', Role.CUSTOMER),
    createUser('Kofi Baah', 'kofi.customer@processlink.gh', Role.CUSTOMER),
    createUser('Adwoa Sarpong', 'adwoa.customer@processlink.gh', Role.CUSTOMER),
  ]);
  const projects = await Promise.all([
    prisma.equipment.create({ data: { title: 'Kumasi Cassava Hub', equipmentType: 'Cassava grater', description: 'Community cassava grating equipment serving smallholder farmers around Kumasi.', region: 'Ashanti', town: 'Kumasi', cost: 85000, fundingTarget: 85000, amountRaised: 85000, status: ProjectStatus.ACTIVE, operatorId: operators[0].id } }),
    prisma.equipment.create({ data: { title: 'Cape Coast Palm Press', equipmentType: 'Palm fruit press', description: 'A small-scale palm fruit pressing unit for local processors.', region: 'Central', town: 'Cape Coast', cost: 62000, fundingTarget: 62000, amountRaised: 31000, status: ProjectStatus.FUNDING, operatorId: operators[1].id } }),
    prisma.equipment.create({ data: { title: 'Tamale Maize Mill', equipmentType: 'Maize mill', description: 'A maize milling service designed for farming communities in Tamale.', region: 'Northern', town: 'Tamale', cost: 48000, fundingTarget: 48000, amountRaised: 0, status: ProjectStatus.PENDING_APPROVAL } }),
    prisma.equipment.create({ data: { title: 'Koforidua Cassava Line', equipmentType: 'Cassava grater', description: 'Cassava processing equipment for the Eastern Region.', region: 'Eastern', town: 'Koforidua', cost: 55000, fundingTarget: 55000, amountRaised: 0, status: ProjectStatus.DRAFT } }),
  ]);
  await prisma.investment.createMany({ data: [
    { investorId: investors[0].id, equipmentId: projects[0].id, amount: 30000, simulatedPaymentRef: 'SIM-SEED-1001' },
    { investorId: investors[1].id, equipmentId: projects[0].id, amount: 35000, simulatedPaymentRef: 'SIM-SEED-1002' },
    { investorId: investors[2].id, equipmentId: projects[0].id, amount: 20000, simulatedPaymentRef: 'SIM-SEED-1003' },
    { investorId: investors[0].id, equipmentId: projects[1].id, amount: 18000, simulatedPaymentRef: 'SIM-SEED-1004' },
    { investorId: investors[2].id, equipmentId: projects[1].id, amount: 13000, simulatedPaymentRef: 'SIM-SEED-1005' },
  ] });
  await prisma.operatorApplication.create({ data: { operatorId: operators[1].id, equipmentId: projects[1].id, experience: 'I have four years of experience operating small-scale palm fruit presses and coordinating processing schedules for local farmers.', status: 'PENDING' } });
  const jobs = await Promise.all([
    prisma.job.create({ data: { customerId: customers[0].id, equipmentId: projects[0].id, operatorId: operators[0].id, produceType: 'Cassava', quantityKg: 750, location: 'Ejisu, Ashanti Region', preferredDate: new Date('2026-10-20'), price: 900, status: JobStatus.PAID, completedAt: new Date('2026-10-20') } }),
    prisma.job.create({ data: { customerId: customers[1].id, equipmentId: projects[0].id, operatorId: operators[0].id, produceType: 'Cassava', quantityKg: 420, location: 'Kumasi, Ashanti Region', preferredDate: new Date('2026-11-12'), price: 550, status: JobStatus.COMPLETED, completedAt: new Date('2026-11-05') } }),
    prisma.job.create({ data: { customerId: customers[2].id, equipmentId: projects[0].id, operatorId: operators[0].id, produceType: 'Cassava', quantityKg: 300, location: 'Tafo, Ashanti Region', preferredDate: new Date('2026-11-15'), price: 400, status: JobStatus.REQUESTED } }),
    prisma.job.create({ data: { customerId: customers[3].id, equipmentId: projects[1].id, operatorId: operators[1].id, produceType: 'Palm fruit', quantityKg: 600, location: 'Cape Coast, Central Region', preferredDate: new Date('2026-11-18'), price: 800, status: JobStatus.ACCEPTED } }),
  ]);
  await prisma.payment.create({ data: { jobId: jobs[0].id, payerId: customers[0].id, amount: 900, status: PaymentStatus.SUCCESSFUL, reference: 'SIM-SEED-PAY-01' } });
  await prisma.expense.createMany({ data: [
    { equipmentId: projects[0].id, jobId: jobs[0].id, amount: 120, category: ExpenseCategory.FUEL, note: 'Fuel for processing day', recordedBy: operators[0].id },
    { equipmentId: projects[0].id, amount: 80, category: ExpenseCategory.MAINTENANCE, note: 'Routine belt maintenance', recordedBy: operators[0].id },
  ] });
  const distribution = await prisma.distribution.create({ data: { equipmentId: projects[0].id, periodStart: new Date('2026-10-01'), periodEnd: new Date('2026-10-31'), grossRevenue: 900, expenses: 200, netRevenue: 700, platformAmount: 70, operatorAmount: 280, investorPool: 350 } });
  await prisma.investorPayout.createMany({ data: [
    { distributionId: distribution.id, investorId: investors[0].id, amount: 105 },
    { distributionId: distribution.id, investorId: investors[1].id, amount: 144.12 },
    { distributionId: distribution.id, investorId: investors[2].id, amount: 82.35 },
  ] });
  await prisma.review.create({ data: { jobId: jobs[0].id, customerId: customers[0].id, operatorId: operators[0].id, rating: 5, comment: 'Friendly operator and good service.' } });
  await prisma.notification.createMany({ data: [
    { userId: investors[0].id, message: 'Your investment portfolio is ready to view.' },
    { userId: operators[0].id, message: 'A new processing request is waiting for you.' },
    { userId: customers[0].id, message: 'Your cassava processing job has been paid.' },
  ] });
  await prisma.auditLog.create({ data: { adminId: admin.id, action: 'SEEDED_DEMO_DATA', targetType: 'SYSTEM', targetId: 'seed' } });
  console.log('Seed complete. All demo accounts use password: ProcessLink123!');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());

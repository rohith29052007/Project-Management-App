import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Hash passwords
    const password = await bcrypt.hash('password123', 10);

    // Create users
    const user1 = await prisma.user.upsert({
        where: { id: 'user_1' },
        update: {},
        create: {
            id: 'user_1',
            name: 'Alex Smith',
            email: 'alexsmith@example.com',
            username: 'alexsmith',
            password: password,
            image: '',
        },
    });

    const user2 = await prisma.user.upsert({
        where: { id: 'user_2' },
        update: {},
        create: {
            id: 'user_2',
            name: 'John Warrel',
            email: 'johnwarrel@example.com',
            username: 'johnwarrel',
            password: password,
            image: '',
        },
    });

    const user3 = await prisma.user.upsert({
        where: { id: 'user_3' },
        update: {},
        create: {
            id: 'user_3',
            name: 'Oliver Watts',
            email: 'oliverwatts@example.com',
            username: 'oliverwatts',
            password: password,
            image: '',
        },
    });

    console.log('✅ Created users');

    // Create workspace
    const workspace = await prisma.workspace.upsert({
        where: { id: 'org_1' },
        update: {},
        create: {
            id: 'org_1',
            name: 'Corp Workspace',
            slug: 'corp-workspace',
            description: 'Main corporate workspace',
            ownerId: user3.id,
            image_url: '',
            settings: {},
            members: {
                create: [
                    {
                        userId: user1.id,
                        role: 'ADMIN',
                    },
                    {
                        userId: user2.id,
                        role: 'ADMIN',
                    },
                    {
                        userId: user3.id,
                        role: 'ADMIN',
                    },
                ],
            },
        },
        include: {
            members: {
                include: { user: true },
            },
        },
    });

    console.log('✅ Created workspace');

    // Create project
    const project = await prisma.project.upsert({
        where: { id: '4d0f6ef3-e798-4d65-a864-00d9f8085c51' },
        update: {},
        create: {
            id: '4d0f6ef3-e798-4d65-a864-00d9f8085c51',
            name: 'LaunchPad CRM',
            description: 'A next-gen CRM for startups to manage customer pipelines, analytics, and automation.',
            priority: 'HIGH',
            status: 'ACTIVE',
            start_date: new Date('2025-10-10'),
            end_date: new Date('2026-02-28'),
            team_lead: user3.id,
            workspaceId: workspace.id,
            progress: 65,
            members: {
                create: [
                    { userId: user1.id },
                    { userId: user2.id },
                    { userId: user3.id },
                ],
            },
            tasks: {
                create: [
                    {
                        title: 'Design Dashboard UI',
                        description: 'Create a modern, responsive CRM dashboard layout.',
                        status: 'IN_PROGRESS',
                        type: 'FEATURE',
                        priority: 'HIGH',
                        assigneeId: user1.id,
                        due_date: new Date('2025-10-31'),
                    },
                    {
                        title: 'Integrate Email API',
                        description: 'Set up SendGrid integration for email campaigns.',
                        status: 'TODO',
                        type: 'TASK',
                        priority: 'MEDIUM',
                        assigneeId: user2.id,
                        due_date: new Date('2025-11-30'),
                    },
                    {
                        title: 'Fix Duplicate Contact Bug',
                        description: 'Duplicate records appear when importing CSV files.',
                        status: 'TODO',
                        type: 'BUG',
                        priority: 'HIGH',
                        assigneeId: user1.id,
                        due_date: new Date('2025-12-05'),
                    },
                ],
            },
        },
        include: {
            members: {
                include: { user: true },
            },
            tasks: {
                include: { assignee: true },
            },
        },
    });

    console.log('✅ Created project with tasks');

    console.log('🎉 Seed completed successfully!');
    console.log(`\nWorkspace: ${workspace.name} (${workspace.id})`);
    console.log(`Project: ${project.name} (${project.id})`);
    console.log(`Users: ${user1.name}, ${user2.name}, ${user3.name}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


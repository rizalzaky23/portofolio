import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ──────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rizalzaky.dev' },
    update: {},
    create: {
      name: 'Rizal Zaky',
      email: 'admin@rizalzaky.dev',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user:', admin.email);

  // ─── About ───────────────────────────────────────────────────────────────────
  await prisma.about.upsert({
    where: { id: 'about-singleton' },
    update: {},
    create: {
      id: 'about-singleton',
      biography: `I'm Rizal Zaky, a passionate Software Developer with a love for building elegant, 
performant web applications. I specialize in full-stack development, bringing ideas to life 
through clean code and thoughtful design. When I'm not coding, I'm exploring new technologies, 
contributing to open-source, and solving challenging problems.

With experience in modern web technologies including React, Node.js, and cloud infrastructure, 
I craft digital experiences that are not only visually stunning but technically sound.`,
      socialLinks: JSON.stringify({
        github: 'https://github.com/rizalzaky',
        linkedin: 'https://linkedin.com/in/rizalzaky',
        instagram: 'https://instagram.com/rizalzaky',
        email: 'hello@rizalzaky.dev',
      }),
      techStack: JSON.stringify([
        'React', 'TypeScript', 'Node.js', 'Express', 'Prisma', 'MySQL',
        'Docker', 'MinIO', 'Vite', 'Tailwind CSS', 'GSAP', 'Framer Motion',
      ]),
    },
  });
  console.log('✅ About section created');

  // ─── Skills ──────────────────────────────────────────────────────────────────
  const skills = [
    { name: 'React', category: 'Frontend', level: 90, icon: 'FaReact', displayOrder: 1 },
    { name: 'TypeScript', category: 'Frontend', level: 88, icon: 'SiTypescript', displayOrder: 2 },
    { name: 'Next.js', category: 'Frontend', level: 85, icon: 'SiNextdotjs', displayOrder: 3 },
    { name: 'Tailwind CSS', category: 'Frontend', level: 92, icon: 'SiTailwindcss', displayOrder: 4 },
    { name: 'Framer Motion', category: 'Frontend', level: 80, icon: 'SiFramer', displayOrder: 5 },
    { name: 'GSAP', category: 'Frontend', level: 75, icon: 'SiGreensock', displayOrder: 6 },
    { name: 'Node.js', category: 'Backend', level: 87, icon: 'FaNodeJs', displayOrder: 1 },
    { name: 'Express.js', category: 'Backend', level: 85, icon: 'SiExpress', displayOrder: 2 },
    { name: 'Prisma', category: 'Backend', level: 82, icon: 'SiPrisma', displayOrder: 3 },
    { name: 'REST API Design', category: 'Backend', level: 88, icon: 'TbApi', displayOrder: 4 },
    { name: 'MySQL', category: 'Database', level: 83, icon: 'SiMysql', displayOrder: 1 },
    { name: 'PostgreSQL', category: 'Database', level: 78, icon: 'SiPostgresql', displayOrder: 2 },
    { name: 'Redis', category: 'Database', level: 72, icon: 'SiRedis', displayOrder: 3 },
    { name: 'Docker', category: 'DevOps', level: 80, icon: 'FaDocker', displayOrder: 1 },
    { name: 'Nginx', category: 'DevOps', level: 75, icon: 'SiNginx', displayOrder: 2 },
    { name: 'GitHub Actions', category: 'DevOps', level: 78, icon: 'SiGithubactions', displayOrder: 3 },
    { name: 'Git', category: 'Tools', level: 92, icon: 'FaGit', displayOrder: 1 },
    { name: 'Figma', category: 'Tools', level: 80, icon: 'FaFigma', displayOrder: 2 },
    { name: 'Postman', category: 'Tools', level: 88, icon: 'SiPostman', displayOrder: 3 },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { id: `skill-${skill.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: { id: `skill-${skill.name.toLowerCase().replace(/\s/g, '-')}`, ...skill },
    });
  }
  console.log('✅ Skills seeded');

  // ─── Experience ──────────────────────────────────────────────────────────────
  const experiences = [
    {
      id: 'exp-1',
      company: 'Tech Startup Co.',
      position: 'Full-Stack Developer',
      description: 'Led development of core product features using React and Node.js. Implemented CI/CD pipelines and improved application performance by 40%. Collaborated with design team to deliver pixel-perfect UIs.',
      website: 'https://example.com',
      startDate: new Date('2023-01-01'),
      endDate: null,
      current: true,
      displayOrder: 1,
    },
    {
      id: 'exp-2',
      company: 'Digital Agency',
      position: 'Frontend Developer',
      description: 'Developed interactive web applications for clients across various industries. Built reusable component libraries and implemented responsive designs. Worked in agile sprints delivering features on schedule.',
      website: 'https://example.com',
      startDate: new Date('2021-06-01'),
      endDate: new Date('2022-12-31'),
      current: false,
      displayOrder: 2,
    },
    {
      id: 'exp-3',
      company: 'Freelance',
      position: 'Web Developer',
      description: 'Delivered custom web solutions for small to medium businesses. Specialized in e-commerce platforms and portfolio sites. Maintained client relationships and provided ongoing technical support.',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2021-05-31'),
      current: false,
      displayOrder: 3,
    },
  ];

  for (const exp of experiences) {
    await prisma.experience.upsert({
      where: { id: exp.id },
      update: {},
      create: exp,
    });
  }
  console.log('✅ Experiences seeded');

  // ─── Projects ────────────────────────────────────────────────────────────────
  const projects = [
    {
      id: 'proj-1',
      title: 'E-Commerce Platform',
      slug: 'e-commerce-platform',
      summary: 'A full-featured e-commerce platform with real-time inventory and payment processing.',
      description: 'Built a scalable e-commerce solution supporting 10k+ products with advanced filtering, cart management, and secure checkout.',
      problem: 'The client needed a modern, scalable e-commerce platform to replace their outdated system that couldn\'t handle peak traffic.',
      solution: 'Designed a microservices-inspired architecture with React frontend, Node.js API, and MySQL database with Redis caching layer.',
      architecture: 'Frontend: React + Vite. Backend: Express + Prisma. Cache: Redis. Payment: Stripe integration.',
      challenges: 'Managing real-time inventory updates across concurrent users was the biggest challenge.',
      lessons: 'Learned the importance of database transaction isolation levels and optimistic locking for inventory management.',
      status: 'PUBLISHED' as const,
      featured: true,
      year: 2024,
      category: 'Web App',
      githubUrl: 'https://github.com/rizalzaky/ecommerce',
      demoUrl: 'https://ecommerce-demo.rizalzaky.dev',
      techStack: JSON.stringify(['React', 'Node.js', 'MySQL', 'Redis', 'Stripe', 'Docker']),
      displayOrder: 1,
      publishedAt: new Date(),
    },
    {
      id: 'proj-2',
      title: 'Task Management App',
      slug: 'task-management-app',
      summary: 'Kanban-style project management tool with real-time collaboration.',
      description: 'A collaborative task management application featuring drag-and-drop Kanban boards, real-time updates via WebSocket, and team workspace management.',
      problem: 'Teams needed a lightweight alternative to Jira that was fast, intuitive, and affordable.',
      solution: 'Built a real-time collaborative board using React-DnD for drag-drop and Socket.io for instant updates.',
      architecture: 'React + Socket.io (frontend), Node.js + Express (backend), MongoDB for flexible document storage.',
      challenges: 'Synchronizing state across multiple clients without conflicts required careful conflict resolution logic.',
      lessons: 'Operational Transformation algorithms are complex but essential for true real-time collaboration.',
      status: 'PUBLISHED' as const,
      featured: true,
      year: 2024,
      category: 'Web App',
      githubUrl: 'https://github.com/rizalzaky/taskmanager',
      demoUrl: 'https://tasks.rizalzaky.dev',
      techStack: JSON.stringify(['React', 'Socket.io', 'Node.js', 'MongoDB', 'Tailwind CSS']),
      displayOrder: 2,
      publishedAt: new Date(),
    },
    {
      id: 'proj-3',
      title: 'AI Writing Assistant',
      slug: 'ai-writing-assistant',
      summary: 'Browser extension that enhances writing with AI-powered suggestions.',
      description: 'A Chrome extension that integrates with OpenAI GPT-4 to provide context-aware writing improvements, grammar correction, and style suggestions.',
      problem: 'Writers spent too much time editing and needed intelligent assistance without switching between tools.',
      solution: 'Built a Chrome extension with a React popup interface that reads page context and generates targeted suggestions.',
      architecture: 'React + Plasmo for extension, OpenAI API for AI, background service workers for async processing.',
      challenges: 'Managing the OpenAI API rate limits and costs while maintaining responsive UX required careful batching.',
      lessons: 'Browser extension development requires deep understanding of Chrome\'s content security policies and messaging APIs.',
      status: 'PUBLISHED' as const,
      featured: false,
      year: 2023,
      category: 'Browser Extension',
      githubUrl: 'https://github.com/rizalzaky/ai-writer',
      demoUrl: null,
      techStack: JSON.stringify(['React', 'TypeScript', 'OpenAI API', 'Chrome Extensions', 'Plasmo']),
      displayOrder: 3,
      publishedAt: new Date(),
    },
    {
      id: 'proj-4',
      title: 'Portfolio CMS',
      slug: 'portfolio-cms',
      summary: 'This very website — a production-ready portfolio with integrated content management.',
      description: 'A premium personal portfolio website featuring an immersive R3F landing page, comprehensive CMS, MinIO storage, and full-stack architecture.',
      problem: 'Needed a portfolio that stands out from template-based sites while being fully manageable without code changes.',
      solution: 'Built from scratch with React Three Fiber for the immersive intro, custom CMS for all content, and MinIO for media storage.',
      architecture: 'React 19 + Vite (frontend), Express + Prisma + MySQL (backend), MinIO (storage), Docker Compose (orchestration).',
      challenges: 'Implementing realistic physics simulation for the lanyard while maintaining 60fps across devices.',
      lessons: 'Three.js physics with Rapier requires careful geometry optimization and instanced rendering for performance.',
      status: 'PUBLISHED' as const,
      featured: true,
      year: 2025,
      category: 'Full Stack',
      githubUrl: 'https://github.com/rizalzaky/portfolio',
      demoUrl: 'https://rizalzaky.dev',
      techStack: JSON.stringify(['React 19', 'Vite', 'Three.js', 'Node.js', 'MySQL', 'MinIO', 'Docker']),
      displayOrder: 4,
      publishedAt: new Date(),
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {},
      create: project,
    });
  }
  console.log('✅ Projects seeded');

  // ─── Achievements ────────────────────────────────────────────────────────────
  const achievements = [
    {
      id: 'ach-1',
      title: '1st Place — National Web Development Competition',
      description: 'Won first place in the national-level web development competition, building a full-stack application in 24 hours under competitive conditions.',
      organizer: 'Ministry of Education Indonesia',
      date: new Date('2023-11-15'),
      category: 'competition',
      featured: true,
      displayOrder: 1,
    },
    {
      id: 'ach-2',
      title: 'Best Innovation Award — Tech Hackathon 2023',
      description: 'Received the Best Innovation Award for developing an AI-powered accessibility tool during a 48-hour hackathon event.',
      organizer: 'Google Developer Student Club',
      date: new Date('2023-08-20'),
      category: 'award',
      featured: true,
      displayOrder: 2,
    },
    {
      id: 'ach-3',
      title: 'Full Scholarship — Software Engineering Bootcamp',
      description: 'Selected among 500+ applicants to receive a full scholarship for an intensive 6-month software engineering bootcamp.',
      organizer: 'Hacktiv8 Indonesia',
      date: new Date('2022-03-01'),
      category: 'scholarship',
      featured: false,
      displayOrder: 3,
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({ where: { id: ach.id }, update: {}, create: ach });
  }
  console.log('✅ Achievements seeded');

  // ─── Certificates ────────────────────────────────────────────────────────────
  const certificates = [
    {
      id: 'cert-1',
      title: 'AWS Certified Developer – Associate',
      issuer: 'Amazon Web Services',
      credentialId: 'AWS-DEV-12345',
      credentialUrl: 'https://aws.amazon.com/certification',
      issueDate: new Date('2024-01-15'),
      expirationDate: new Date('2027-01-15'),
      featured: true,
      displayOrder: 1,
    },
    {
      id: 'cert-2',
      title: 'Meta Front-End Developer Professional Certificate',
      issuer: 'Meta / Coursera',
      credentialId: 'META-FE-67890',
      credentialUrl: 'https://coursera.org/verify',
      issueDate: new Date('2023-06-10'),
      featured: true,
      displayOrder: 2,
    },
    {
      id: 'cert-3',
      title: 'Docker Certified Associate',
      issuer: 'Docker Inc.',
      credentialId: 'DCA-54321',
      credentialUrl: 'https://certification.docker.com',
      issueDate: new Date('2023-09-20'),
      expirationDate: new Date('2026-09-20'),
      featured: false,
      displayOrder: 3,
    },
  ];

  for (const cert of certificates) {
    await prisma.certificate.upsert({ where: { id: cert.id }, update: {}, create: cert });
  }
  console.log('✅ Certificates seeded');

  // ─── Settings ────────────────────────────────────────────────────────────────
  const defaultSettings = [
    { key: 'site_title', value: 'Rizal Zaky — Software Developer' },
    { key: 'site_description', value: 'Full-stack software developer specializing in modern web applications. Building elegant, performant digital experiences.' },
    { key: 'site_url', value: 'https://rizalzaky.dev' },
    { key: 'contact_email', value: 'hello@rizalzaky.dev' },
    { key: 'google_analytics_id', value: '' },
    { key: 'maintenance_mode', value: 'false' },
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({ where: { key: setting.key }, update: {}, create: setting });
  }
  console.log('✅ Settings seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('──────────────────────────────────');
  console.log('Admin credentials:');
  console.log('  Email:    admin@rizalzaky.dev');
  console.log('  Password: Admin@123456');
  console.log('──────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

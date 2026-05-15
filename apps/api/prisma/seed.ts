import { PrismaClient, ServerType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Admin Settings ──────────────────────────────────────────────
  const settings = [
    {
      key: 'scraping_interval_minutes',
      value: 30,
      category: 'scraping',
      description: 'Interval between scraping cycles in minutes',
    },
    {
      key: 'stream_provider_priority',
      value: ['VIDSTREAM', 'FILEMOON', 'STREAMSB', 'MIRROR_CDN'],
      category: 'streaming',
      description: 'Ordered list of stream provider priorities',
    },
    {
      key: 'max_concurrent_scrapes',
      value: 3,
      category: 'scraping',
      description: 'Maximum number of concurrent scraping tasks',
    },
    {
      key: 'cache_default_ttl_seconds',
      value: 3600,
      category: 'caching',
      description: 'Default cache TTL in seconds',
    },
    {
      key: 'maintenance_mode',
      value: false,
      category: 'general',
      description: 'Enable maintenance mode (blocks all non-admin requests)',
    },
    {
      key: 'default_subtitle_lang',
      value: 'id',
      category: 'streaming',
      description: 'Default subtitle language code',
    },
  ];

  for (const setting of settings) {
    await prisma.adminSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value as any, category: setting.category, description: setting.description },
      create: { key: setting.key, value: setting.value as any, category: setting.category, description: setting.description },
    });
  }

  console.log(`✓ Seeded ${settings.length} admin settings`);

  // ── Streaming Servers ───────────────────────────────────────────
  const servers = [
    {
      name: 'Vidstream',
      slug: 'vidstream',
      baseUrl: 'https://vidstream.pro',
      region: 'global',
      type: ServerType.VIDSTREAM,
      priority: 1,
      config: { referer: 'https://vidstream.pro', supportedQualities: ['360p', '480p', '720p', '1080p'] },
    },
    {
      name: 'Filemoon',
      slug: 'filemoon',
      baseUrl: 'https://filemoon.sx',
      region: 'global',
      type: ServerType.FILEMOON,
      priority: 2,
      config: { referer: 'https://filemoon.sx', supportedQualities: ['360p', '480p', '720p', '1080p'] },
    },
    {
      name: 'StreamSB',
      slug: 'streamsb',
      baseUrl: 'https://streamsb.net',
      region: 'global',
      type: ServerType.STREAMSB,
      priority: 3,
      config: { referer: 'https://streamsb.net', supportedQualities: ['360p', '480p', '720p'] },
    },
    {
      name: 'Mirror CDN',
      slug: 'mirror-cdn',
      baseUrl: 'https://mirror.cdn',
      region: 'asia',
      type: ServerType.MIRROR_CDN,
      priority: 4,
      config: { referer: 'https://mirror.cdn', supportedQualities: ['480p', '720p', '1080p'] },
    },
    {
      name: 'Gogo Server',
      slug: 'gogo-server',
      baseUrl: 'https://gogoanime.cl',
      region: 'global',
      type: ServerType.GOGO_SERVER,
      priority: 5,
      config: { referer: 'https://gogoanime.cl', supportedQualities: ['360p', '480p', '720p'] },
    },
    {
      name: 'Zoro Server',
      slug: 'zoro-server',
      baseUrl: 'https://zoro.to',
      region: 'global',
      type: ServerType.ZORO_SERVER,
      priority: 6,
      config: { referer: 'https://zoro.to', supportedQualities: ['360p', '480p', '720p', '1080p'] },
    },
  ];

  for (const server of servers) {
    await prisma.streamingServer.upsert({
      where: { slug: server.slug },
      update: { name: server.name, baseUrl: server.baseUrl, region: server.region, type: server.type, priority: server.priority, config: server.config as any },
      create: server,
    });
  }

  console.log(`✓ Seeded ${servers.length} streaming servers`);

  // ── Admin User ──────────────────────────────────────────────────
  const adminEmail = 'admin@sorami.app';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        username: 'admin',
        email: adminEmail,
        role: UserRole.ADMIN,
        passwordHash,
        isPremium: true,
        premiumUntil: new Date('2099-12-31'),
      },
    });
    console.log('✓ Seeded admin user (admin@sorami.app / admin123)');
  } else {
    console.log('✗ Admin user already exists, skipping');
  }

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

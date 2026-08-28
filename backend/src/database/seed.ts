import { db } from './db';

async function main() {
  console.log('🌱 Seeding KijaniLink database...');
  db.seedDefaults();
  console.log('🎉 KijaniLink Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  });

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const slugify = require('../src/utils/slugify');

const CATEGORIES = [
  { name: 'Real Estate', icon: '🏠', subcategories: [
    { name: 'Flats for Sale', attrs: ['bhk', 'area_sqft', 'price'] },
    { name: 'Flats for Rent', attrs: ['bhk', 'furnishing', 'rent'] },
    { name: 'PG Accommodation', attrs: ['gender_pref', 'sharing_type', 'rent'] },
    { name: 'Looking for Roommates', attrs: ['gender_pref', 'budget'] },
    { name: 'Commercial Spaces', attrs: ['area_sqft', 'price'] },
    { name: 'Office Rentals', attrs: ['area_sqft', 'rent'] },
    { name: 'Land for Sale', attrs: ['area_sqft', 'price'] }
  ]},
  { name: 'Jobs & Opportunities', icon: '💼', subcategories: [
    { name: 'Hiring', attrs: ['role', 'salary_range', 'job_type'] },
    { name: 'Freelance Projects', attrs: ['skills', 'budget'] },
    { name: 'Part-time Jobs', attrs: ['role', 'pay'] },
    { name: 'Internship Opportunities', attrs: ['role', 'stipend'] },
    { name: 'Business Partnerships', attrs: ['business_type'] },
    { name: 'Referral Requests', attrs: ['role', 'company'] }
  ]},
  { name: 'Buy & Sell', icon: '🛍️', subcategories: [
    { name: 'Electronics', attrs: ['brand', 'condition', 'price'] },
    { name: 'Furniture', attrs: ['condition', 'price'] },
    { name: 'Vehicles', attrs: ['brand', 'year', 'price'] },
    { name: 'Mobile Phones', attrs: ['brand', 'condition', 'price'] },
    { name: 'Home Appliances', attrs: ['brand', 'condition', 'price'] },
    { name: 'Books', attrs: ['subject', 'condition', 'price'] },
    { name: 'Fashion', attrs: ['size', 'condition', 'price'] },
    { name: 'Industrial Equipment', attrs: ['equipment_type', 'price'] }
  ]},
  { name: 'Business Services', icon: '🏢', subcategories: [
    { name: 'Lead Generation', attrs: ['industry'] },
    { name: 'Marketing Services', attrs: ['service_type'] },
    { name: 'Digital Marketing', attrs: ['platforms'] },
    { name: 'Website Development', attrs: ['tech_stack'] },
    { name: 'Salesforce Consulting', attrs: ['services_offered'] },
    { name: 'AI Automation', attrs: ['use_case'] },
    { name: 'Business Software', attrs: ['software_type'] },
    { name: 'Manufacturing Leads', attrs: ['product_type'] }
  ]},
  { name: 'Construction', icon: '🏗️', subcategories: [
    { name: 'Contractors', attrs: ['services', 'experience_years'] },
    { name: 'Architects', attrs: ['specialization'] },
    { name: 'Civil Engineers', attrs: ['specialization'] },
    { name: 'Interior Designers', attrs: ['style_specialty'] },
    { name: 'Building Materials', attrs: ['material_type', 'price'] },
    { name: 'Scrap Buying & Selling', attrs: ['scrap_type', 'price_per_unit'] }
  ]},
  { name: 'Vehicles', icon: '🚗', subcategories: [
    { name: 'Used Cars', attrs: ['brand', 'year', 'km_driven', 'price'] },
    { name: 'Bikes', attrs: ['brand', 'year', 'price'] },
    { name: 'Commercial Vehicles', attrs: ['vehicle_type', 'price'] },
    { name: 'Rentals', attrs: ['vehicle_type', 'rent_per_day'] }
  ]},
  { name: 'Education', icon: '📚', subcategories: [
    { name: 'Tutors', attrs: ['subject', 'level', 'fee'] },
    { name: 'Coaching', attrs: ['exam_type', 'fee'] },
    { name: 'Skill Training', attrs: ['skill', 'duration', 'fee'] },
    { name: 'Online Courses', attrs: ['subject', 'fee'] }
  ]},
  { name: 'Community', icon: '🤝', subcategories: [
    { name: 'Events', attrs: ['event_type', 'date', 'location'] },
    { name: 'Networking', attrs: ['group_type'] },
    { name: 'Startup Meetups', attrs: ['focus_area', 'date'] },
    { name: 'Business Meetups', attrs: ['industry', 'date'] },
    { name: 'Local Recommendations', attrs: ['service_type', 'area'] }
  ]}
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding categories...');

  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name);
    await Category.findOneAndUpdate(
      { slug },
      {
        name: cat.name,
        slug,
        icon: cat.icon,
        isActive: true,
        subcategories: cat.subcategories.map((s) => ({ name: s.name, slug: slugify(s.name), attrs: s.attrs }))
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ ${cat.name}`);
  }

  console.log('Done seeding.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

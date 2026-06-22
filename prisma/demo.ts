/**
 * Demo seed — run once after main seed:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/demo.ts
 *
 * Creates:
 *  • Services category + 6 sub-categories
 *  • Deactivates all categories except the 5 required
 *  • 3 demo vendors (approved)
 *  • 17 demo products/services (approved + active)
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop`

async function main() {
  console.log('🌱 Running Ecove demo seed…\n')

  // ── 1. Services category ──────────────────────────────────────────────────
  const services = await prisma.category.upsert({
    where:  { slug: 'services' },
    update: { isActive: true },
    create: {
      name:            'Services',
      slug:            'services',
      description:     'Professional services from verified providers across Nigeria.',
      displayOrder:    5,
      isActive:        true,
      metaTitle:       'Services – Hire Professionals | Ecove Marketplace',
      metaDescription: 'Find and hire verified professionals for web design, photography, cleaning, tutoring and more on Ecove.',
    },
  })
  console.log('✅ Services category ready')

  // ── 2. Services sub-categories ───────────────────────────────────────────
  const subCats = [
    { name: 'Web & Tech',           slug: 'services-web-tech',       order: 1, desc: 'Web design, development and IT support.' },
    { name: 'Design & Creative',    slug: 'services-design',         order: 2, desc: 'Graphic design, branding and video production.' },
    { name: 'Digital Marketing',    slug: 'services-digital-marketing', order: 3, desc: 'SEO, social media management and ads.' },
    { name: 'Photography & Video',  slug: 'services-photography',    order: 4, desc: 'Events, portraits, product photography.' },
    { name: 'Home & Repairs',       slug: 'services-home-repairs',   order: 5, desc: 'Plumbing, electrical, cleaning and maintenance.' },
    { name: 'Tutoring & Training',  slug: 'services-tutoring',       order: 6, desc: 'Private lessons, professional training.' },
  ]

  for (const s of subCats) {
    await prisma.category.upsert({
      where:  { slug: s.slug },
      update: { isActive: true },
      create: {
        name:            s.name,
        slug:            s.slug,
        description:     s.desc,
        parentId:        services.id,
        displayOrder:    s.order,
        isActive:        true,
      },
    })
  }
  console.log('✅ 6 service sub-categories ready')

  // ── 3. Deactivate unwanted top-level categories ───────────────────────────
  const keepSlugs = ['phones-tablets', 'computing', 'electronics', 'fashion', 'services']
  await prisma.category.updateMany({
    where: {
      slug:     { notIn: keepSlugs },
      parentId: null,
    },
    data: { isActive: false },
  })
  console.log('✅ Inactive categories: Automotive, Baby Products, Beauty & Health, Books & Education, Gaming, Groceries, Home & Kitchen, Sports & Outdoors')

  // ── 4. Fetch the active categories we need ────────────────────────────────
  const [phones, computing, electronics, fashion, webTech, photoVideo, homeRepairs, tutoring] =
    await Promise.all([
      prisma.category.findUnique({ where: { slug: 'phones-tablets' } }),
      prisma.category.findUnique({ where: { slug: 'computing' } }),
      prisma.category.findUnique({ where: { slug: 'electronics' } }),
      prisma.category.findUnique({ where: { slug: 'fashion' } }),
      prisma.category.findUnique({ where: { slug: 'services-web-tech' } }),
      prisma.category.findUnique({ where: { slug: 'services-photography' } }),
      prisma.category.findUnique({ where: { slug: 'services-home-repairs' } }),
      prisma.category.findUnique({ where: { slug: 'services-tutoring' } }),
    ])

  // ── 5. Demo vendors ───────────────────────────────────────────────────────
  const pw = await bcrypt.hash('Demo@Ecove2025!', 12)

  async function upsertVendor(
    email: string,
    firstName: string,
    lastName: string,
    bizName: string,
    slug: string,
    state: string,
    city: string,
    description: string,
  ) {
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email, firstName, lastName,
          passwordHash:    pw,
          role:            'vendor',
          isActive:        true,
          isEmailVerified: true,
        },
      })
    }
    const existing = await prisma.vendor.findUnique({ where: { userId: user.id } })
    if (existing) return existing
    return prisma.vendor.create({
      data: {
        userId:          user.id,
        businessName:    bizName,
        slug,
        description,
        phone:           '+2348012345678',
        city,
        state,
        address:         `${city}, ${state}`,
        bankName:        'Access Bank',
        bankAccountNumber: '0123456789',
        bankAccountName: bizName,
        status:          'approved',
        approvedAt:      new Date(),
        averageRating:   4.7,
        reviewCount:     24,
        totalOrders:     148,
        isAutoApproved:  false,
      },
    })
  }

  const vendorTech = await upsertVendor(
    'techvault@ecove.com.ng', 'Emeka', 'Okafor',
    'TechVault NG', 'techvault-ng', 'Lagos', 'Ikeja',
    'Nigeria\'s trusted source for premium gadgets, smartphones, laptops and consumer electronics. All items verified and warranted.',
  )
  const vendorFashion = await upsertVendor(
    'stylezone@ecove.com.ng', 'Amina', 'Yusuf',
    'StyleZone NG', 'stylezone-ng', 'Abuja', 'Wuse',
    'Contemporary African fashion — Ankara prints, Adire, modern office wear and footwear for men and women across Nigeria.',
  )
  const vendorServices = await upsertVendor(
    'proservices@ecove.com.ng', 'Chidi', 'Nwachukwu',
    'ProServices Hub', 'proservices-hub', 'Lagos', 'Victoria Island',
    'Verified professional services — web development, photography, digital marketing, cleaning and tutoring delivered across Nigeria.',
  )
  console.log('✅ 3 demo vendors ready (TechVault NG, StyleZone NG, ProServices Hub)')

  // ── 6. Helper to create product with primary image ────────────────────────
  async function upsertProduct(slug: string, data: {
    vendorId: string
    categoryId: string
    name: string
    description: string
    shortDescription: string
    price: number
    comparePrice?: number
    stock: number
    brand?: string
    isFeatured?: boolean
    isBestSeller?: boolean
    isFlashSale?: boolean
    flashSalePrice?: number
    tags: string[]
    imageUrl: string
    status?: 'approved' | 'pending'
  }) {
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      console.log(`  ⏭  ${data.name} already exists`)
      return existing
    }
    const product = await prisma.product.create({
      data: {
        vendorId:         data.vendorId,
        categoryId:       data.categoryId,
        name:             data.name,
        slug,
        description:      data.description,
        shortDescription: data.shortDescription,
        price:            data.price,
        comparePrice:     data.comparePrice,
        stock:            data.stock,
        brand:            data.brand,
        isFeatured:       data.isFeatured  ?? false,
        isBestSeller:     data.isBestSeller ?? false,
        isFlashSale:      data.isFlashSale  ?? false,
        flashSalePrice:   data.flashSalePrice,
        flashSaleEnd:     data.isFlashSale ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
        tags:             data.tags,
        status:           data.status ?? 'approved',
        isActive:         true,
        metaTitle:        `${data.name} | Ecove`,
        metaDescription:  data.shortDescription,
        images: {
          create: { url: data.imageUrl, isPrimary: true, altText: data.name },
        },
      },
    })
    console.log(`  ✅ ${data.name}`)
    return product
  }

  // ── 7. Phones & Tablets ───────────────────────────────────────────────────
  console.log('\n📱 Phones & Tablets:')
  await upsertProduct('iphone-15-pro-max-256gb', {
    vendorId: vendorTech.id, categoryId: phones!.id,
    name: 'Apple iPhone 15 Pro Max 256GB',
    shortDescription: 'Titanium design, A17 Pro chip, 48MP ProRAW camera. Includes 1-year Apple warranty.',
    description: 'The iPhone 15 Pro Max pushes the boundaries of what a smartphone can do. Featuring the groundbreaking A17 Pro chip, a surgical-grade titanium frame, and an advanced 48MP camera system with ProRAW and ProRes video capability. Comes with USB-C connectivity and Action button. Nigerian warranty included.',
    price: 1450000, comparePrice: 1580000,
    stock: 12, brand: 'Apple',
    isFeatured: true, isBestSeller: true,
    tags: ['iphone', 'apple', 'smartphone', '5g', 'ios'],
    imageUrl: img('1510557880182-3d4d3cba35a5'),
  })

  await upsertProduct('samsung-galaxy-s24-ultra', {
    vendorId: vendorTech.id, categoryId: phones!.id,
    name: 'Samsung Galaxy S24 Ultra 512GB',
    shortDescription: 'Built-in S Pen, 200MP camera, Snapdragon 8 Gen 3. Android 14.',
    description: 'The Galaxy S24 Ultra redefines productivity with its built-in S Pen and Snapdragon 8 Gen 3 processor. Featuring a 200MP Adaptive Pixel camera, 5000mAh battery, and 45W fast charging. Titanium frame with Armor Aluminium. 7 years of OS and security updates.',
    price: 1180000, comparePrice: 1250000,
    stock: 18, brand: 'Samsung',
    isFeatured: true,
    tags: ['samsung', 'galaxy', 'android', 's-pen', '5g'],
    imageUrl: img('1610945415114-ec0fad5b0c05'),
  })

  await upsertProduct('tecno-camon-30-pro', {
    vendorId: vendorTech.id, categoryId: phones!.id,
    name: 'Tecno Camon 30 Pro 5G 256GB',
    shortDescription: '50MP RGBW front camera, Dimensity 7020, 5000mAh battery.',
    description: 'Tecno Camon 30 Pro brings flagship photography to an affordable price point. Features a 50MP RGBW front camera with moonlight ring flash, Dimensity 7020 processor, and a 5000mAh battery with 33W fast charging. AMOLED display with 144Hz refresh rate.',
    price: 185000, comparePrice: 210000,
    stock: 35, brand: 'Tecno',
    isFlashSale: true, flashSalePrice: 168000,
    tags: ['tecno', 'camon', '5g', 'android', 'budget'],
    imageUrl: img('1598327105666-5b89351aff97'),
  })

  await upsertProduct('infinix-hot-40-pro', {
    vendorId: vendorTech.id, categoryId: phones!.id,
    name: 'Infinix Hot 40 Pro 256GB',
    shortDescription: '108MP triple camera, 6.78" HD+ display, 5000mAh battery.',
    description: 'The Infinix Hot 40 Pro delivers exceptional value with a 108MP triple rear camera, 6.78-inch HD+ display, and Helio G99 processor. The 5000mAh battery supports 35W fast charging. XOS 13 based on Android 13.',
    price: 125000,
    stock: 50, brand: 'Infinix',
    isBestSeller: true,
    tags: ['infinix', 'hot', 'budget', 'android'],
    imageUrl: img('1511707171634-56c9e80abc5b'),
  })

  // ── 8. Computing ──────────────────────────────────────────────────────────
  console.log('\n💻 Computing:')
  await upsertProduct('macbook-air-m2-13-inch', {
    vendorId: vendorTech.id, categoryId: computing!.id,
    name: 'Apple MacBook Air M2 13" 8GB/256GB',
    shortDescription: 'Apple M2 chip, 18-hour battery, fanless design, Liquid Retina display.',
    description: 'The MacBook Air with M2 chip is impossibly thin at just 11.3mm and features the Liquid Retina display, 1080p FaceTime camera, and MagSafe charging. With up to 18 hours of battery life and the powerful M2 chip, this is the ideal laptop for professionals and students.',
    price: 1250000, comparePrice: 1350000,
    stock: 8, brand: 'Apple',
    isFeatured: true,
    tags: ['macbook', 'apple', 'm2', 'laptop', 'macos'],
    imageUrl: img('1517336714731-489689fd1ca8'),
  })

  await upsertProduct('hp-pavilion-15-i5-gen12', {
    vendorId: vendorTech.id, categoryId: computing!.id,
    name: 'HP Pavilion 15 Core i5 12th Gen 8GB/512GB',
    shortDescription: 'Intel i5-1235U, Full HD IPS display, 512GB SSD, Windows 11.',
    description: 'The HP Pavilion 15 is built for everyday productivity. Intel Core i5-1235U processor with Intel Iris Xe Graphics, 8GB DDR4 RAM, 512GB PCIe NVMe SSD, and a Full HD IPS anti-glare display. Dual speakers with HP Audio Boost. Windows 11 Home.',
    price: 380000, comparePrice: 420000,
    stock: 15, brand: 'HP',
    isBestSeller: true,
    tags: ['hp', 'pavilion', 'laptop', 'intel', 'windows'],
    imageUrl: img('1496181133206-80ce9b88a853'),
  })

  await upsertProduct('dell-inspiron-14-amd', {
    vendorId: vendorTech.id, categoryId: computing!.id,
    name: 'Dell Inspiron 14 AMD Ryzen 5 8GB/256GB',
    shortDescription: 'AMD Ryzen 5 7520U, FHD display, 41Wh battery, Windows 11 Home.',
    description: 'Dell Inspiron 14 powered by AMD Ryzen 5 7520U processor with integrated Radeon 610M graphics. 8GB LPDDR5 RAM, 256GB NVMe SSD, 14-inch FHD WVA anti-glare display. Compact and lightweight at 1.56kg.',
    price: 295000,
    stock: 22, brand: 'Dell',
    isFlashSale: true, flashSalePrice: 265000,
    tags: ['dell', 'inspiron', 'amd', 'laptop', 'ryzen'],
    imageUrl: img('1525547719571-a2d4ac8945e2'),
  })

  // ── 9. Electronics ────────────────────────────────────────────────────────
  console.log('\n📺 Electronics:')
  await upsertProduct('lg-55-4k-smart-tv', {
    vendorId: vendorTech.id, categoryId: electronics!.id,
    name: 'LG 55" 4K UHD NanoCell Smart TV',
    shortDescription: 'NanoCell display, ThinQ AI, Dolby Vision IQ, 4K 120Hz.',
    description: 'LG NanoCell 55NANO75 delivers stunning 4K NanoCell picture quality with Dolby Vision IQ and HDR10 Pro. Powered by α5 Gen5 AI Processor 4K with ThinQ AI. webOS 22 smart platform with Netflix, YouTube, Prime Video built-in. 4 HDMI ports, 3 USB ports.',
    price: 480000, comparePrice: 550000,
    stock: 6, brand: 'LG',
    isFeatured: true,
    tags: ['lg', '4k', 'smart-tv', 'nanocell', 'uhd'],
    imageUrl: img('1593359677879-a4af27b7b7e9'),
  })

  await upsertProduct('hisense-43-fhd-smart-tv', {
    vendorId: vendorTech.id, categoryId: electronics!.id,
    name: 'Hisense 43" FHD Smart TV with Voice Remote',
    shortDescription: 'Full HD LED panel, VIDAA U6 smart OS, DTS Virtual X audio.',
    description: 'Hisense 43A4K features a Full HD LED display with VIDAA U6 smart operating system. Comes with a voice remote for hands-free control. DTS Virtual X surround sound delivers immersive audio. 2 HDMI, 2 USB ports, and built-in Wi-Fi.',
    price: 185000, comparePrice: 210000,
    stock: 14, brand: 'Hisense',
    isBestSeller: true,
    tags: ['hisense', 'smart-tv', 'fhd', 'led', 'voice-remote'],
    imageUrl: img('1461151304267-38535e780c79'),
  })

  await upsertProduct('sony-ht-s40r-soundbar', {
    vendorId: vendorTech.id, categoryId: electronics!.id,
    name: 'Sony HT-S40R 5.1ch Real Surround Soundbar',
    shortDescription: '600W peak power, wireless rear speakers, Dolby Digital, HDMI ARC.',
    description: 'Sony HT-S40R delivers true 5.1-channel surround sound with wireless rear speakers for genuine immersive audio. 600W peak output power, Dolby Digital decoding, HDMI ARC connectivity, and Bluetooth streaming. S-Force PRO Front Surround technology.',
    price: 95000,
    stock: 20, brand: 'Sony',
    isFlashSale: true, flashSalePrice: 82000,
    tags: ['sony', 'soundbar', 'surround', 'bluetooth', 'dolby'],
    imageUrl: img('1608043152269-423dbba4e7e1'),
  })

  // ── 10. Fashion ───────────────────────────────────────────────────────────
  console.log('\n👗 Fashion:')
  await upsertProduct('mens-ankara-corporate-blazer', {
    vendorId: vendorFashion.id, categoryId: fashion!.id,
    name: "Men's Ankara Corporate Blazer",
    shortDescription: 'Premium Ankara fabric blazer, tailored fit, available in sizes M–3XL.',
    description: "Elevate your work wardrobe with this stunning Ankara corporate blazer. Made from 100% premium Ankara cotton, fully lined with a smooth satin interior. Features two front pockets, single button closure, and a tailored modern fit. Available in bold geometric and floral prints. Dry clean recommended.",
    price: 18500, comparePrice: 24000,
    stock: 80, brand: 'StyleZone NG',
    isFeatured: true, isBestSeller: true,
    tags: ['ankara', 'blazer', 'mens', 'corporate', 'african-print'],
    imageUrl: img('1594938298603-58b6f2c0e6e5'),
  })

  await upsertProduct('womens-adire-maxi-dress', {
    vendorId: vendorFashion.id, categoryId: fashion!.id,
    name: "Women's Adire Tie-Dye Maxi Dress",
    shortDescription: 'Handcrafted Adire fabric, floor-length, elastic waist, sizes S–2XL.',
    description: "This beautiful Adire tie-dye maxi dress celebrates Nigerian heritage with a contemporary silhouette. Handcrafted by artisans using traditional Adire techniques on premium cotton fabric. Features an elasticated waist for comfort, flutter sleeves, and a side pocket. Machine washable. A true statement piece.",
    price: 12500,
    stock: 60, brand: 'StyleZone NG',
    isBestSeller: true,
    tags: ['adire', 'maxi-dress', 'women', 'african', 'tie-dye'],
    imageUrl: img('1551232864-3f0890e580d9'),
  })

  await upsertProduct('unisex-leather-chelsea-boots', {
    vendorId: vendorFashion.id, categoryId: fashion!.id,
    name: 'Unisex Genuine Leather Chelsea Boots',
    shortDescription: 'Full-grain leather upper, elastic side panels, sizes 36–46.',
    description: 'Classic Chelsea boots crafted from full-grain genuine leather with elastic side panels for easy slip-on wear. Features a sturdy rubber sole for durability and a comfortable cushioned insole. Suitable for both casual and semi-formal occasions. Available in black and tan. Handstitched in Lagos.',
    price: 22000, comparePrice: 28000,
    stock: 45, brand: 'StyleZone NG',
    isFeatured: true,
    isFlashSale: true, flashSalePrice: 18500,
    tags: ['leather', 'boots', 'chelsea', 'unisex', 'handmade'],
    imageUrl: img('1542291026-7eec264c27ff'),
  })

  // ── 11. Services ──────────────────────────────────────────────────────────
  console.log('\n🛠  Services:')
  await upsertProduct('professional-website-design-package', {
    vendorId: vendorServices.id, categoryId: webTech!.id,
    name: 'Professional Business Website Design',
    shortDescription: '5-page responsive website, SEO setup, 3 months free hosting included.',
    description: 'Get a stunning, mobile-responsive business website built on Next.js or WordPress. Package includes: custom design (up to 5 pages), contact form, Google Analytics integration, basic SEO setup, SSL certificate, and 3 months of free hosting on a premium server. Delivery within 7–14 working days. Revisions included.',
    price: 150000, comparePrice: 200000,
    stock: 999, brand: 'ProServices Hub',
    isFeatured: true,
    tags: ['web-design', 'website', 'nextjs', 'wordpress', 'business'],
    imageUrl: img('1461749280684-dccba630e2f6'),
  })

  await upsertProduct('social-media-management-monthly', {
    vendorId: vendorServices.id, categoryId: webTech!.id,
    name: 'Social Media Management – Monthly Package',
    shortDescription: '3 platforms, 20 posts/month, ad management, monthly analytics report.',
    description: 'Grow your brand online with our complete social media management package. We handle content creation, scheduling, community management, and paid ad campaigns across 3 platforms (Instagram, Facebook, X/Twitter). Includes 20 branded posts per month, Story/Reel content, monthly analytics report, and strategy consultation.',
    price: 45000,
    stock: 999, brand: 'ProServices Hub',
    isBestSeller: true,
    tags: ['social-media', 'marketing', 'instagram', 'facebook', 'digital'],
    imageUrl: img('1432888498266-38ffec3eaf0a'),
  })

  await upsertProduct('corporate-brand-photography-package', {
    vendorId: vendorServices.id, categoryId: photoVideo!.id,
    name: 'Corporate Brand Photography Package',
    shortDescription: '4-hour shoot, 2 locations, 50 edited hi-res photos, same-week delivery.',
    description: 'Elevate your brand identity with our professional corporate photography package. Includes a 4-hour photo session across up to 2 locations in Lagos or Abuja, professional lighting equipment, a wardrobe consultation call, 50 fully retouched high-resolution images, and delivery within 5 business days. Ideal for LinkedIn profiles, websites, and marketing materials.',
    price: 85000, comparePrice: 110000,
    stock: 999, brand: 'ProServices Hub',
    isFeatured: true,
    tags: ['photography', 'corporate', 'branding', 'portraits', 'professional'],
    imageUrl: img('1452802447250-470a88ac82bc'),
  })

  await upsertProduct('home-deep-cleaning-3-bedroom', {
    vendorId: vendorServices.id, categoryId: homeRepairs!.id,
    name: 'Home Deep Cleaning – 3-Bedroom Apartment',
    shortDescription: 'Full apartment deep clean, eco-friendly products, insured cleaners.',
    description: 'A thorough top-to-bottom deep cleaning of your 3-bedroom apartment by our team of trained, background-checked, and insured cleaners. Service includes: all rooms, bathrooms, kitchen degreasing, ceiling fans, blinds, and balcony. We use eco-friendly, pet-safe cleaning products. Available in Lagos and Abuja. Typical duration: 5–6 hours.',
    price: 25000,
    stock: 999, brand: 'ProServices Hub',
    isBestSeller: true,
    tags: ['cleaning', 'home', 'deep-clean', 'apartment', 'lagos'],
    imageUrl: img('1563453392212-326f5e854473'),
  })

  await upsertProduct('private-stem-tutoring-per-session', {
    vendorId: vendorServices.id, categoryId: tutoring!.id,
    name: 'Private STEM Tutoring – Per Session (1.5hrs)',
    shortDescription: 'One-on-one tutoring for Maths, Physics, Chemistry or Biology (SS1–SS3/JAMB).',
    description: 'One-on-one private tutoring sessions for secondary school students (SS1–SS3) and JAMB candidates. Subjects available: Mathematics, Further Mathematics, Physics, Chemistry, Biology. Conducted by certified graduate teachers with 5+ years experience. Available online (Zoom/Google Meet) or in-person within Lagos. Session notes and practice questions provided.',
    price: 8500,
    stock: 999, brand: 'ProServices Hub',
    tags: ['tutoring', 'stem', 'jamb', 'waec', 'private-lessons'],
    imageUrl: img('1523050854058-8df90110c9f1'),
  })

  // ── 12. Summary ───────────────────────────────────────────────────────────
  const [prodCount, vendorCount, activeCats] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.vendor.count({ where: { status: 'approved' } }),
    prisma.category.count({ where: { isActive: true } }),
  ])

  console.log('\n🎉 Demo seed complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Active categories : ${activeCats}  (5 top-level + 6 service sub-cats)`)
  console.log(`Approved vendors  : ${vendorCount}`)
  console.log(`Live products     : ${prodCount}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Vendor logins (password: Demo@Ecove2025!):')
  console.log('  techvault@ecove.com.ng   → TechVault NG')
  console.log('  stylezone@ecove.com.ng   → StyleZone NG')
  console.log('  proservices@ecove.com.ng → ProServices Hub')
}

main()
  .catch((e) => { console.error('❌ Demo seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

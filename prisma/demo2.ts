/**
 * Demo seed 2 — run after demo.ts:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/demo2.ts
 *
 * Adds:
 *  • 6 Fashion sub-categories
 *  • 3 more Phones & Tablets products
 *  • 2 more Computing products
 *  • 2 more Electronics products
 *  • 10 Fashion products (Women's, Men's, Footwear, Accessories, Traditional)
 *  • 4 more Services products
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop`

async function main() {
  console.log('🌱 Running Ecove demo seed 2…\n')

  // ── 1. Fashion sub-categories ─────────────────────────────────────────────
  const fashion = await prisma.category.findUnique({ where: { slug: 'fashion' } })
  if (!fashion) {
    throw new Error('Fashion category not found — ensure demo.ts has been run first.')
  }

  const fashionSubCats = [
    { name: "Women's Fashion",    slug: 'fashion-women',       order: 1, desc: "Dresses, blouses, skirts, co-ord sets and more for women." },
    { name: "Men's Fashion",      slug: 'fashion-men',         order: 2, desc: "Shirts, trousers, suits, agbada and corporate wear for men." },
    { name: "Kids' Fashion",      slug: 'fashion-kids',        order: 3, desc: "Cute and comfortable clothing for boys and girls of all ages." },
    { name: 'Footwear',           slug: 'fashion-footwear',    order: 4, desc: "Shoes, sandals, boots and sneakers for men and women." },
    { name: 'Bags & Accessories', slug: 'fashion-accessories', order: 5, desc: "Handbags, tote bags, laptop bags, belts and fashion accessories." },
    { name: 'Traditional & Ankara', slug: 'fashion-traditional', order: 6, desc: "Ankara prints, Aso-oke, Adire, agbada and traditional Nigerian attire." },
  ]

  for (const s of fashionSubCats) {
    await prisma.category.upsert({
      where:  { slug: s.slug },
      update: { isActive: true },
      create: {
        name:         s.name,
        slug:         s.slug,
        description:  s.desc,
        parentId:     fashion.id,
        displayOrder: s.order,
        isActive:     true,
      },
    })
  }
  console.log('✅ 6 fashion sub-categories ready')

  // ── 2. Fetch all required categories ─────────────────────────────────────
  const [
    phones, computing, electronics,
    fashionWomen, fashionMen, fashionFootwear, fashionAccessories, fashionTraditional,
    servicesDesign, servicesHomeRepairs, servicesWebTech, servicesPhotography,
  ] = await Promise.all([
    prisma.category.findUnique({ where: { slug: 'phones-tablets' } }),
    prisma.category.findUnique({ where: { slug: 'computing' } }),
    prisma.category.findUnique({ where: { slug: 'electronics' } }),
    prisma.category.findUnique({ where: { slug: 'fashion-women' } }),
    prisma.category.findUnique({ where: { slug: 'fashion-men' } }),
    prisma.category.findUnique({ where: { slug: 'fashion-footwear' } }),
    prisma.category.findUnique({ where: { slug: 'fashion-accessories' } }),
    prisma.category.findUnique({ where: { slug: 'fashion-traditional' } }),
    prisma.category.findUnique({ where: { slug: 'services-design' } }),
    prisma.category.findUnique({ where: { slug: 'services-home-repairs' } }),
    prisma.category.findUnique({ where: { slug: 'services-web-tech' } }),
    prisma.category.findUnique({ where: { slug: 'services-photography' } }),
  ])

  // ── 3. Fetch vendors by email ─────────────────────────────────────────────
  const [userTech, userFashion, userServices] = await Promise.all([
    prisma.user.findUnique({ where: { email: 'techvault@ecove.com.ng' } }),
    prisma.user.findUnique({ where: { email: 'stylezone@ecove.com.ng' } }),
    prisma.user.findUnique({ where: { email: 'proservices@ecove.com.ng' } }),
  ])

  if (!userTech || !userFashion || !userServices) {
    throw new Error('One or more vendor users not found — ensure demo.ts has been run first.')
  }

  const [vendorTech, vendorFashion, vendorServices] = await Promise.all([
    prisma.vendor.findUnique({ where: { userId: userTech.id } }),
    prisma.vendor.findUnique({ where: { userId: userFashion.id } }),
    prisma.vendor.findUnique({ where: { userId: userServices.id } }),
  ])

  if (!vendorTech || !vendorFashion || !vendorServices) {
    throw new Error('One or more vendor records not found — ensure demo.ts has been run first.')
  }

  console.log('✅ Vendors loaded (TechVault NG, StyleZone NG, ProServices Hub)')

  // ── 4. Helper to upsert a product with primary image ─────────────────────
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
        isFeatured:       data.isFeatured   ?? false,
        isBestSeller:     data.isBestSeller ?? false,
        isFlashSale:      data.isFlashSale  ?? false,
        flashSalePrice:   data.flashSalePrice,
        flashSaleEnd:     data.isFlashSale ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
        tags:             data.tags,
        status:           'approved',
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

  // ── 5. Phones & Tablets (3 more) ─────────────────────────────────────────
  console.log('\n📱 Phones & Tablets (additional):')

  await upsertProduct('samsung-galaxy-a55-5g', {
    vendorId: vendorTech.id, categoryId: phones!.id,
    name: 'Samsung Galaxy A55 5G 256GB',
    shortDescription: 'Snapdragon 8 Gen 1, 50MP triple camera, 5000mAh battery, IP67 rating. Samsung warranty included.',
    description: 'The Samsung Galaxy A55 5G brings flagship features to the mid-range segment. Powered by a capable processor with a stunning Super AMOLED display and 50MP triple rear camera system. Features IP67 dust and water resistance, 256GB internal storage, and 5G connectivity. Includes Samsung Knox security and 5000mAh battery with 25W fast charging. Official Nigerian warranty.',
    price: 280000, comparePrice: 310000,
    stock: 28, brand: 'Samsung',
    isFeatured: true,
    tags: ['samsung', 'galaxy', 'a55', '5g', 'android', 'amoled'],
    imageUrl: img('1610945415114-ec0fad5b0c05'),
  })

  await upsertProduct('xiaomi-redmi-note-13-pro-5g', {
    vendorId: vendorTech.id, categoryId: phones!.id,
    name: 'Xiaomi Redmi Note 13 Pro 5G 256GB',
    shortDescription: '200MP OIS camera, Dimensity 7200 Ultra, 67W HyperCharge. Best value 5G phone in Nigeria.',
    description: 'The Redmi Note 13 Pro 5G raises the bar for what a budget smartphone can offer. The industry-leading 200MP OIS camera captures stunning detail in all lighting conditions. MediaTek Dimensity 7200 Ultra processor handles any task with ease, while 67W HyperCharge replenishes the 5000mAh battery in just 46 minutes. AMOLED display with 120Hz refresh rate.',
    price: 195000, comparePrice: 220000,
    stock: 40, brand: 'Xiaomi',
    isFlashSale: true, flashSalePrice: 168000,
    isBestSeller: true,
    tags: ['xiaomi', 'redmi', 'note', '5g', '200mp', 'android'],
    imageUrl: img('1598327105666-5b89351aff97'),
  })

  await upsertProduct('oppo-reno-12-pro-5g', {
    vendorId: vendorTech.id, categoryId: phones!.id,
    name: 'Oppo Reno 12 Pro 5G 512GB',
    shortDescription: 'Dimensity 9200+, 50MP Hasselblad portrait camera, 80W SUPERVOOC charge, 512GB storage.',
    description: 'The Oppo Reno 12 Pro 5G is engineered for creative professionals and power users. Co-designed with Hasselblad, its 50MP portrait camera system delivers cinematic photography. The Dimensity 9200+ chipset ensures blazing-fast performance for gaming and multitasking. 80W SUPERVOOC charging fills the 4600mAh battery in under 30 minutes. IP65 splash resistance.',
    price: 395000, comparePrice: 430000,
    stock: 15, brand: 'OPPO',
    tags: ['oppo', 'reno', '5g', 'hasselblad', 'android', 'flagship'],
    imageUrl: img('1511707171634-56c9e80abc5b'),
  })

  // ── 6. Computing (2 more) ─────────────────────────────────────────────────
  console.log('\n💻 Computing (additional):')

  await upsertProduct('hp-elitebook-840-g10-i7', {
    vendorId: vendorTech.id, categoryId: computing!.id,
    name: 'HP EliteBook 840 G10 i7 16GB/512GB',
    shortDescription: 'Intel Core i7-1355U, 14" IPS FHD, 16GB DDR5, 512GB NVMe SSD, Windows 11 Pro. Enterprise-grade business laptop.',
    description: 'The HP EliteBook 840 G10 is engineered for enterprise professionals who demand performance, security, and durability. Intel Core i7-1355U vPro processor with Intel Iris Xe Graphics, 16GB DDR5 RAM, and a 512GB PCIe Gen4 NVMe SSD deliver lightning-fast productivity. MIL-STD 810H tested, HP Sure Start firmware security, and a 14-inch IPS anti-glare display. HP Wolf Security built in. Perfect for corporate and government use across Nigeria.',
    price: 685000, comparePrice: 750000,
    stock: 9, brand: 'HP',
    isFeatured: true,
    tags: ['hp', 'elitebook', 'laptop', 'intel', 'i7', 'business', 'enterprise'],
    imageUrl: img('1525547719571-a2d4ac8945e2'),
  })

  await upsertProduct('lenovo-ideapad-slim-5-ryzen7', {
    vendorId: vendorTech.id, categoryId: computing!.id,
    name: 'Lenovo IdeaPad Slim 5 Ryzen 7 16GB/512GB',
    shortDescription: 'AMD Ryzen 7 7730U, 16" 2.5K IPS display, 16GB RAM, 512GB SSD, thin & lightweight at 1.67kg.',
    description: 'The Lenovo IdeaPad Slim 5 offers an ideal balance of power and portability for students and professionals. AMD Ryzen 7 7730U processor with Radeon integrated graphics handles heavy workloads effortlessly. The 16-inch 2.5K IPS display offers vivid colours and sharp detail for content creation and productivity. All-day battery life with Rapid Charge support. Available with genuine Windows 11 Home.',
    price: 265000, comparePrice: 300000,
    stock: 18, brand: 'Lenovo',
    isBestSeller: true,
    tags: ['lenovo', 'ideapad', 'amd', 'ryzen', 'laptop', 'student'],
    imageUrl: img('1496181133206-80ce9b88a853'),
  })

  // ── 7. Electronics (2 more) ───────────────────────────────────────────────
  console.log('\n📺 Electronics (additional):')

  await upsertProduct('jbl-charge-5-bluetooth-speaker', {
    vendorId: vendorTech.id, categoryId: electronics!.id,
    name: 'JBL Charge 5 Portable Bluetooth Speaker',
    shortDescription: '40W output, 20-hour playtime, IP67 waterproof, built-in powerbank. Ideal for outdoor use in Nigeria.',
    description: 'The JBL Charge 5 delivers powerful 40W stereo sound with deep bass and clear highs wherever you go. IP67 waterproof and dustproof rating makes it perfect for the beach, poolside, or Nigerian markets and outdoor events. 20-hour playtime per charge, plus a built-in USB-A powerbank to keep your devices topped up. PartyBoost compatible to link multiple JBL speakers for bigger sound. USB-C charging.',
    price: 65000, comparePrice: 80000,
    stock: 35, brand: 'JBL',
    isFlashSale: true, flashSalePrice: 52000,
    isBestSeller: true,
    tags: ['jbl', 'speaker', 'bluetooth', 'waterproof', 'portable', 'outdoor'],
    imageUrl: img('1608043152269-423dbba4e7e1'),
  })

  await upsertProduct('hisense-516l-side-by-side-fridge', {
    vendorId: vendorTech.id, categoryId: electronics!.id,
    name: 'Hisense 516L Side-by-Side Refrigerator',
    shortDescription: 'No-frost, inverter compressor, water & ice dispenser, multi-airflow cooling. Energy-efficient for Nigerian homes.',
    description: 'The Hisense 516L Side-by-Side Refrigerator is the perfect centrepiece for modern Nigerian kitchens. Total No-Frost technology eliminates manual defrosting, while the twin inverter compressor saves electricity and operates quietly. Features a built-in water and ice dispenser, multi-airflow system for even cooling, and a deodorising filter to keep food fresh longer. Energy Class A+. Compatible with standard 220V Nigerian power supply.',
    price: 395000, comparePrice: 450000,
    stock: 7, brand: 'Hisense',
    isFeatured: true,
    tags: ['hisense', 'refrigerator', 'fridge', 'side-by-side', 'no-frost', 'inverter'],
    imageUrl: img('1461151304267-38535e780c79'),
  })

  // ── 8. Fashion — Women's (2) ──────────────────────────────────────────────
  console.log("\n👗 Fashion — Women's:")

  await upsertProduct('womens-peplum-ankara-blouse', {
    vendorId: vendorFashion.id, categoryId: fashionWomen!.id,
    name: "Women's Peplum Ankara Blouse",
    shortDescription: 'Bold Ankara print peplum blouse, flutter sleeves, sizes 6–20. Pair with trousers or a pencil skirt.',
    description: "Stand out at the office or at events with this stunning peplum Ankara blouse from StyleZone NG. Crafted from high-quality 100% cotton Ankara fabric, it features flutter sleeves, a fitted bodice, and a flattering peplum hem that suits all body types. Available in a rotating selection of bold geometric and floral prints. Pairs beautifully with plain trousers, pencil skirts, or jeans. Sizes 6–20 available. Dry clean or gentle hand wash.",
    price: 8500, comparePrice: 12000,
    stock: 90,
    isFeatured: true, isBestSeller: true,
    tags: ['ankara', 'blouse', 'women', 'peplum', 'african-print', 'office-wear'],
    imageUrl: img('1551232864-3f0890e580d9'),
  })

  await upsertProduct('womens-palazzo-pants', {
    vendorId: vendorFashion.id, categoryId: fashionWomen!.id,
    name: "Women's High-Waist Palazzo Pants",
    shortDescription: 'Wide-leg palazzo trousers, elastic high waist, flowy fabric, sizes 6–22. Comfortable for everyday wear.',
    description: "These high-waist palazzo pants are a wardrobe essential for the modern Nigerian woman. Made from lightweight, flowy fabric that drapes elegantly, they feature a wide elastic waist for all-day comfort and a flattering wide-leg silhouette. Available in solid colours and subtle prints. Versatile enough for casual outings, office wear, and evening events. Sizes 6–22. Machine washable.",
    price: 11000,
    stock: 65,
    tags: ['palazzo', 'trousers', 'women', 'wide-leg', 'casual', 'office-wear'],
    imageUrl: img('1581091226825-a6a2a5aee158'),
  })

  // ── 9. Fashion — Men's (2) ────────────────────────────────────────────────
  console.log("\n👔 Fashion — Men's:")

  await upsertProduct('mens-senator-kaftan-cap', {
    vendorId: vendorFashion.id, categoryId: fashionMen!.id,
    name: "Men's Senator Kaftan & Cap Set",
    shortDescription: 'Premium embroidered senator kaftan with matching cap, sizes M–5XL. Perfect for Fridays and celebrations.',
    description: "Look distinguished in this premium men's senator kaftan and matching cap set. Tailored from high-quality linen-blend fabric and finished with intricate embroidery at the neckline, cuffs, and hem. The relaxed, breathable silhouette is ideal for Friday wear, eid celebrations, naming ceremonies, and corporate events. Available in white, sky blue, ash grey, and off-white. Sizes M–5XL. Dry clean recommended.",
    price: 22000, comparePrice: 28000,
    stock: 55,
    isFeatured: true,
    tags: ['senator', 'kaftan', 'men', 'nigerian', 'traditional', 'linen'],
    imageUrl: img('1594938298603-58b6f2c0e6e5'),
  })

  await upsertProduct('mens-3-piece-corporate-suit', {
    vendorId: vendorFashion.id, categoryId: fashionMen!.id,
    name: "Men's 3-Piece Corporate Suit",
    shortDescription: 'Slim-fit 3-piece suit — jacket, trousers & waistcoat. Premium polyester-wool blend, sizes 36–52.',
    description: "Make a powerful impression with this slim-fit 3-piece corporate suit from StyleZone NG. Constructed from a premium polyester-wool blend for a sharp, wrinkle-resistant finish. Includes a fully lined blazer with notch lapels, matching flat-front trousers with adjustable waist, and a coordinating waistcoat. Available in charcoal, navy blue, and dark grey. Custom sizing and alterations available on request. Sizes 36–52. Dry clean only.",
    price: 65000, comparePrice: 80000,
    stock: 30,
    tags: ['suit', 'corporate', 'men', '3-piece', 'slim-fit', 'formal'],
    imageUrl: img('1617196034183-421b4040ed20'),
  })

  // ── 10. Fashion — Footwear (2) ────────────────────────────────────────────
  console.log('\n👠 Fashion — Footwear:')

  await upsertProduct('womens-block-heel-sandals', {
    vendorId: vendorFashion.id, categoryId: fashionFootwear!.id,
    name: "Women's Chunky Block Heel Sandals",
    shortDescription: 'Ankle-strap block heel sandals, 7cm heel, faux leather upper, sizes 36–42. Comfortable for all-day wear.',
    description: "Step out in style and comfort with these chic chunky block heel sandals. Featuring a sturdy 7cm block heel for stability, an adjustable ankle strap, and a cushioned footbed for all-day comfort. The faux leather upper is available in nude, black, and rose gold. Suitable for office wear, parties, and outdoor events. Sizes 36–42. Wipe clean with a damp cloth.",
    price: 15000, comparePrice: 20000,
    stock: 60,
    isBestSeller: true,
    tags: ['sandals', 'heels', 'women', 'block-heel', 'ankle-strap', 'footwear'],
    imageUrl: img('1542291026-7eec264c27ff'),
  })

  await upsertProduct('mens-leather-derby-shoes', {
    vendorId: vendorFashion.id, categoryId: fashionFootwear!.id,
    name: "Men's Genuine Leather Derby Shoes",
    shortDescription: 'Full-grain leather derby shoes, lace-up, cushioned insole, sizes 39–46. Classic office and formal wear.',
    description: "A timeless addition to any man's wardrobe, these genuine leather derby shoes are handcrafted for comfort and durability. Full-grain leather upper develops a distinguished patina with wear. Features a cushioned leather insole, sturdy rubber outsole for grip, and a classic open-lacing derby construction. Available in black and dark brown. Sizes 39–46. Polish regularly for lasting shine. Made in Lagos.",
    price: 18500, comparePrice: 24000,
    stock: 42,
    isFeatured: true,
    tags: ['derby', 'shoes', 'men', 'leather', 'formal', 'office'],
    imageUrl: img('1542291026-7eec264c27ff'),
  })

  // ── 11. Fashion — Accessories (2) ────────────────────────────────────────
  console.log('\n👜 Fashion — Bags & Accessories:')

  await upsertProduct('womens-leather-tote-bag', {
    vendorId: vendorFashion.id, categoryId: fashionAccessories!.id,
    name: "Women's Genuine Leather Tote Bag",
    shortDescription: 'Large genuine leather tote bag, inner zip pocket, magnetic closure. Spacious enough for work and daily use.',
    description: "Carry everything you need in style with this spacious genuine leather tote bag. Crafted from top-grain cowhide leather with reinforced handles and sturdy stitching for long-lasting use. Features a large main compartment with a magnetic snap closure, an inner zip pocket, two slip pockets, and a key clip. The wide base keeps it upright and stable. Available in black, tan, and burgundy. Spot clean or professional leather care recommended.",
    price: 22000, comparePrice: 30000,
    stock: 50,
    isFeatured: true,
    tags: ['tote-bag', 'leather', 'women', 'handbag', 'work-bag', 'accessories'],
    imageUrl: img('1548036328-c9fa89d128fa'),
  })

  await upsertProduct('mens-premium-laptop-bag', {
    vendorId: vendorFashion.id, categoryId: fashionAccessories!.id,
    name: 'Men\'s Premium Laptop Bag 15.6"',
    shortDescription: 'Padded 15.6" laptop compartment, USB charging port, water-resistant fabric. Ideal for professionals.',
    description: "Keep your tech and essentials organised with this premium men's laptop bag. Designed for the modern Nigerian professional, it features a padded 15.6-inch laptop compartment, dedicated tablet sleeve, multiple organiser pockets, and an external USB charging port with built-in cable. Water-resistant Oxford fabric exterior with PU leather accents. Adjustable shoulder strap and padded back panel for comfort. Fits most 15.6-inch laptops including MacBook Pro, HP, Dell, and Lenovo.",
    price: 12000,
    stock: 70,
    tags: ['laptop-bag', 'men', 'work-bag', 'professional', 'usb', 'accessories'],
    imageUrl: img('1548036328-c9fa89d128fa'),
  })

  // ── 12. Fashion — Traditional & Ankara (2) ───────────────────────────────
  console.log('\n🪡 Fashion — Traditional & Ankara:')

  await upsertProduct('couples-ankara-matching-set', {
    vendorId: vendorFashion.id, categoryId: fashionTraditional!.id,
    name: "Couples' Ankara Matching Outfit Set",
    shortDescription: "His & hers Ankara matching set — men's kaftan & women's dress. Perfect for weddings, aso-ebi, and owambe events.",
    description: "Arrive in coordinated elegance with this premium couples' Ankara matching outfit set. The men's piece is a classic senator-style kaftan with embroidered detailing, while the women's is a midi A-line dress with puffed sleeves — both cut from the same bold Ankara fabric. Available in a selection of vibrant, high-quality Ankara prints. Customisation options available for print choice and sizing. Ideal for weddings, introduction ceremonies, family photoshoots, and owambe parties. Dry clean recommended.",
    price: 35000, comparePrice: 45000,
    stock: 40,
    isFeatured: true,
    tags: ['ankara', 'couples', 'matching', 'owambe', 'wedding', 'aso-ebi', 'traditional'],
    imageUrl: img('1594938298603-58b6f2c0e6e5'),
  })

  await upsertProduct('aso-oke-gele-ipele-set', {
    vendorId: vendorFashion.id, categoryId: fashionTraditional!.id,
    name: 'Aso-oke Gele & Ipele Set (Ladies)',
    shortDescription: 'Premium hand-woven aso-oke gele and ipele set. Pre-tied gele available. Perfect for owambe and Yoruba celebrations.',
    description: "Celebrate in authentic Nigerian tradition with this premium hand-woven aso-oke gele and ipele (shoulder wrap) set. Made by skilled artisans using high-quality aso-oke fabric with intricate woven patterns and metallic thread accents. The gele is pre-sized for easy tying or available as a full length for professional tying. The ipele matches perfectly for a coordinated traditional look. Available in gold, deep blue, burgundy, and ivory. Suitable for weddings, naming ceremonies, and high-profile Yoruba celebrations.",
    price: 28000,
    stock: 35,
    tags: ['aso-oke', 'gele', 'ipele', 'traditional', 'yoruba', 'owambe', 'women'],
    imageUrl: img('1551232864-3f0890e580d9'),
  })

  // ── 13. Services (4 more) ─────────────────────────────────────────────────
  console.log('\n🛠  Services (additional):')

  await upsertProduct('logo-brand-identity-design', {
    vendorId: vendorServices.id, categoryId: servicesDesign!.id,
    name: 'Logo & Brand Identity Design Package',
    shortDescription: 'Custom logo + full brand identity kit — brand guidelines, business card, letterhead. Unlimited revisions.',
    description: 'Establish a strong, memorable brand presence with our comprehensive Logo & Brand Identity Design Package. Our experienced designers work closely with you to create a unique logo concept that reflects your business values. The full package includes: primary and secondary logo variations, full-colour and monochrome versions, brand colour palette, typography guide, business card design, letterhead template, email signature, and a brand style guide PDF. Unlimited revisions until you are 100% satisfied. Final files delivered in AI, EPS, PNG, and SVG formats. Turnaround: 5–10 business days.',
    price: 75000, comparePrice: 100000,
    stock: 999,
    isFeatured: true,
    tags: ['logo', 'branding', 'graphic-design', 'identity', 'business', 'creative'],
    imageUrl: img('1611162617213-7d7a39e9b1d7'),
  })

  await upsertProduct('ac-service-repair', {
    vendorId: vendorServices.id, categoryId: servicesHomeRepairs!.id,
    name: 'Air Conditioner Service & Repair',
    shortDescription: 'Professional AC service, gas refill, filter cleaning and fault diagnosis. All AC brands. Lagos & Abuja.',
    description: 'Keep your air conditioner running efficiently with our professional AC service and repair package. Our certified technicians handle all major brands including LG, Samsung, Hisense, Daikin, Midea, and more. Service includes: thorough filter and coil cleaning, refrigerant gas top-up, electrical connections check, thermostat calibration, and a full system performance test. Fault diagnosis and part replacement quoted separately. Flexible scheduling available, including weekends. Serving Lagos and Abuja. 30-day workmanship guarantee.',
    price: 15000,
    stock: 999,
    isBestSeller: true,
    tags: ['ac', 'air-conditioner', 'repair', 'service', 'home', 'appliance'],
    imageUrl: img('1563453392212-326f5e854473'),
  })

  await upsertProduct('mobile-app-mvp-development', {
    vendorId: vendorServices.id, categoryId: servicesWebTech!.id,
    name: 'Mobile App MVP Development',
    shortDescription: 'Cross-platform React Native MVP — iOS & Android. UI design, backend API, app store submission included.',
    description: 'Launch your startup idea fast with our Mobile App MVP Development service. We build cross-platform mobile apps using React Native that run natively on both iOS and Android. The MVP package includes: product discovery workshop, UI/UX wireframing and design, React Native development, a RESTful backend API (Node.js/PostgreSQL), basic push notifications, app store submission for both Apple App Store and Google Play, and 30 days of post-launch support. Typical delivery: 6–10 weeks depending on complexity. NDA available. Fully Nigerian-based development team.',
    price: 450000, comparePrice: 600000,
    stock: 999,
    isFeatured: true,
    tags: ['mobile-app', 'react-native', 'ios', 'android', 'mvp', 'startup', 'development'],
    imageUrl: img('1555949963-ff9fe0c870eb'),
  })

  await upsertProduct('event-videography-full-day', {
    vendorId: vendorServices.id, categoryId: servicesPhotography!.id,
    name: 'Event Videography Package (Full Day)',
    shortDescription: '8-hour event coverage, 2 videographers, cinematic highlight reel, full raw footage. Lagos & Abuja.',
    description: 'Capture every unforgettable moment of your special event with our Full Day Event Videography Package. Two professional videographers with cinema-grade cameras and stabilisers cover your event for up to 8 hours, ensuring nothing is missed — from setup to last dance. Deliverables include: a 3–5 minute cinematic highlight reel, full edited ceremony/event footage, and all raw footage on a hard drive or cloud transfer. Same-day teaser clip available as an add-on. Colour grading and background music licensing included. Suitable for weddings, corporate events, product launches, and owambe celebrations. Available in Lagos and Abuja.',
    price: 120000, comparePrice: 150000,
    stock: 999,
    tags: ['videography', 'event', 'wedding', 'corporate', 'cinematography', 'photography'],
    imageUrl: img('1452802447250-470a88ac82bc'),
  })

  // ── 14. Summary ───────────────────────────────────────────────────────────
  const [prodCount, activeCats, fashionSubCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.category.count({ where: { parent: { slug: 'fashion' }, isActive: true } }),
  ])

  console.log('\n🎉 Demo seed 2 complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Active categories    : ${activeCats}  (includes 6 new fashion sub-cats)`)
  console.log(`Fashion sub-cats     : ${fashionSubCount}`)
  console.log(`Total live products  : ${prodCount}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('New products added:')
  console.log('  📱 Phones    : Samsung Galaxy A55 5G, Xiaomi Redmi Note 13 Pro 5G, Oppo Reno 12 Pro 5G')
  console.log('  💻 Computing : HP EliteBook 840 G10 i7, Lenovo IdeaPad Slim 5 Ryzen 7')
  console.log('  📺 Electronics: JBL Charge 5, Hisense 516L Side-by-Side Fridge')
  console.log("  👗 Fashion   : 2x Women's, 2x Men's, 2x Footwear, 2x Accessories, 2x Traditional")
  console.log('  🛠  Services  : Logo Design, AC Repair, Mobile App MVP, Event Videography')
}

main()
  .catch((e) => { console.error('❌ Demo seed 2 failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

/**
 * Demo seed 3 — run after demo.ts and demo2.ts:
 *   npx tsx prisma/demo3.ts
 *
 * Adds:
 *  • Reactivates Groceries + 5 sub-categories
 *  • 5 Grocery products
 *  • 6 cross-category Service products
 *  • 3 more Phones & Tablets products
 *  • 3 more Electronics products
 *  • 3 more Fashion products
 *  Total: 20 new products
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop`

async function addProduct(data: {
  slug:            string
  name:            string
  description:     string
  price:           number
  comparePrice?:   number
  stock:           number
  categoryId:      string
  vendorId:        string
  imageUrl:        string
  isFeatured?:     boolean
  isBestSeller?:   boolean
  isFlashSale?:    boolean
  flashSalePrice?: number
  tags?:           string[]
}) {
  const existing = await prisma.product.findUnique({ where: { slug: data.slug } })
  if (existing) {
    console.log(`  ⏭  ${data.name} already exists`)
    return existing
  }
  const product = await prisma.product.create({
    data: {
      vendorId:       data.vendorId,
      categoryId:     data.categoryId,
      name:           data.name,
      slug:           data.slug,
      description:    data.description,
      price:          data.price,
      comparePrice:   data.comparePrice,
      stock:          data.stock,
      isFeatured:     data.isFeatured   ?? false,
      isBestSeller:   data.isBestSeller ?? false,
      isFlashSale:    data.isFlashSale  ?? false,
      flashSalePrice: data.flashSalePrice,
      flashSaleEnd:   data.isFlashSale
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : undefined,
      tags:           data.tags ?? [],
      status:         'approved',
      isActive:       true,
      metaTitle:      `${data.name} | Ecove`,
      images: {
        create: { url: data.imageUrl, isPrimary: true, altText: data.name },
      },
    },
  })
  console.log(`  ✅ ${data.name}`)
  return product
}

async function main() {
  console.log('🌱 Running Ecove demo seed 3…\n')

  // ── 1. Reactivate Groceries + add sub-categories ──────────────────────────
  const groceries = await prisma.category.upsert({
    where:  { slug: 'groceries' },
    update: { isActive: true },
    create: {
      name: 'Groceries', slug: 'groceries', displayOrder: 5, isActive: true,
      metaTitle: 'Groceries – Shop Online | Ecove Marketplace',
      metaDescription: 'Buy groceries online in Nigeria. Delivered fast.',
    },
  })

  const grocerySubCats = [
    { name: 'Pantry Staples',  slug: 'groceries-pantry',    order: 1 },
    { name: 'Fresh Produce',   slug: 'groceries-produce',   order: 2 },
    { name: 'Beverages',       slug: 'groceries-beverages', order: 3 },
    { name: 'Dairy & Eggs',    slug: 'groceries-dairy',     order: 4 },
    { name: 'Snacks & Treats', slug: 'groceries-snacks',    order: 5 },
  ]
  for (const s of grocerySubCats) {
    await prisma.category.upsert({
      where:  { slug: s.slug },
      update: { isActive: true },
      create: {
        name: s.name, slug: s.slug, parentId: groceries.id,
        displayOrder: s.order, isActive: true,
      },
    })
  }
  console.log('✅ Groceries reactivated + 5 sub-categories ready\n')

  // ── 2. Fetch categories ───────────────────────────────────────────────────
  const [phones, electronics, fashion, services, groceriesPantry, fashionMen, fashionWomen, fashionFootwear] =
    await Promise.all([
      prisma.category.findUnique({ where: { slug: 'phones-tablets' } }),
      prisma.category.findUnique({ where: { slug: 'electronics' } }),
      prisma.category.findUnique({ where: { slug: 'fashion' } }),
      prisma.category.findUnique({ where: { slug: 'services' } }),
      prisma.category.findUnique({ where: { slug: 'groceries-pantry' } }),
      prisma.category.findUnique({ where: { slug: 'fashion-men' } }),
      prisma.category.findUnique({ where: { slug: 'fashion-women' } }),
      prisma.category.findUnique({ where: { slug: 'fashion-footwear' } }),
    ])

  if (!phones || !electronics || !fashion || !services) {
    throw new Error('Missing required category — ensure demo.ts ran first.')
  }

  // ── 3. Fetch vendors ──────────────────────────────────────────────────────
  const [userTech, userFashion, userServices] = await Promise.all([
    prisma.user.findUnique({ where: { email: 'techvault@ecove.com.ng' } }),
    prisma.user.findUnique({ where: { email: 'stylezone@ecove.com.ng' } }),
    prisma.user.findUnique({ where: { email: 'proservices@ecove.com.ng' } }),
  ])

  if (!userTech || !userFashion || !userServices) {
    throw new Error('Vendor accounts not found — ensure demo.ts ran first.')
  }

  const [vendorTech, vendorFashion, vendorServices] = await Promise.all([
    prisma.vendor.findFirst({ where: { userId: userTech.id } }),
    prisma.vendor.findFirst({ where: { userId: userFashion.id } }),
    prisma.vendor.findFirst({ where: { userId: userServices.id } }),
  ])

  if (!vendorTech || !vendorFashion || !vendorServices) {
    throw new Error('Vendor records not found.')
  }

  const pantryId = groceriesPantry?.id ?? groceries.id

  // ── 4. Grocery products (5) ───────────────────────────────────────────────
  console.log('Adding grocery products…')
  await addProduct({ slug: 'mama-gold-rice-25kg', name: 'Mama Gold Parboiled Rice 25kg',
    description: "Nigeria's favourite long-grain parboiled rice. Cooks fluffy every time. Ideal for parties, restaurants and large households. 25 kg bag.",
    price: 24500, stock: 80, categoryId: pantryId, vendorId: vendorServices.id,
    imageUrl: img('1586201375761-83865001e31c'), tags: ['rice', 'groceries', 'food', 'staple'] })

  await addProduct({ slug: 'sunola-vegetable-oil-5l', name: 'Sunola Vegetable Oil 5L',
    description: 'Premium quality sunflower-blend vegetable oil. High smoke point, light taste, cholesterol-free. Perfect for everyday Nigerian cooking.',
    price: 8500, stock: 120, categoryId: pantryId, vendorId: vendorServices.id,
    imageUrl: img('1474979687098-1bba9b8f0f5e'), tags: ['oil', 'cooking', 'groceries'] })

  await addProduct({ slug: 'indomie-chicken-noodles-carton', name: 'Indomie Chicken Noodles (Carton of 40)',
    description: 'The number one noodle brand in Nigeria. 40 packs of 70g Indomie Chicken flavour. Great value bulk pack for families and businesses.',
    price: 9800, comparePrice: 11000, stock: 60, categoryId: pantryId, vendorId: vendorServices.id,
    imageUrl: img('1569050467447-ce54b3bbc37d'), tags: ['noodles', 'indomie', 'food', 'bulk'] })

  await addProduct({ slug: 'peak-evaporated-milk-carton', name: 'Peak Full Cream Evaporated Milk (Carton of 24)',
    description: 'Rich, creamy and nutritious Peak Milk. Perfect for tea, pap, custard and pastries. Each tin is 400g. Carton of 24 tins.',
    price: 18500, stock: 40, categoryId: pantryId, vendorId: vendorServices.id,
    imageUrl: img('1550583724-b2692b85b150'), tags: ['milk', 'dairy', 'groceries', 'peak'] })

  await addProduct({ slug: 'golden-penny-spaghetti-carton', name: 'Golden Penny Spaghetti 500g (Carton of 20)',
    description: "Nigeria's trusted pasta brand. Made from the finest durum wheat semolina. Smooth, firm texture. 20 packs of 500g per carton.",
    price: 12500, stock: 55, categoryId: pantryId, vendorId: vendorServices.id,
    imageUrl: img('1551462147-ff29053bfc14'), tags: ['pasta', 'spaghetti', 'food', 'golden-penny'] })

  console.log()

  // ── 5. Cross-category Service products (6) ────────────────────────────────
  console.log('Adding cross-category service products…')
  await addProduct({ slug: 'phone-screen-repair-service', name: 'Phone Screen Repair & Replacement',
    description: 'Professional screen repair for iPhone, Samsung, Tecno, Infinix and more. OEM screens used. 3-month warranty. Same-day service in Lagos and Abuja.',
    price: 12000, stock: 100, categoryId: services.id, vendorId: vendorServices.id,
    imageUrl: img('1558618666-fcd25c85cd64'), isFeatured: true,
    tags: ['phone repair', 'screen', 'service', 'mobile'] })

  await addProduct({ slug: 'laptop-repair-upgrade-service', name: 'Laptop Repair & Upgrade Service',
    description: 'Full laptop diagnostics, motherboard repair, RAM/SSD upgrade, cooling system cleaning and OS installation. HP, Dell, Lenovo, Apple supported. 6-month warranty.',
    price: 15000, stock: 50, categoryId: services.id, vendorId: vendorServices.id,
    imageUrl: img('1588702547919-b0a7d23da0f1'), isFeatured: true,
    tags: ['laptop repair', 'tech support', 'service', 'computing'] })

  await addProduct({ slug: 'ac-installation-service', name: 'Air Conditioner Installation & Servicing',
    description: 'Professional AC installation for split units up to 2HP. Includes copper piping, drainage, gas charging and a 1-year service agreement. Lagos delivery & install.',
    price: 35000, stock: 30, categoryId: services.id, vendorId: vendorServices.id,
    imageUrl: img('1581578731548-c64695cc6952'),
    tags: ['AC', 'installation', 'electronics', 'service', 'cooling'] })

  await addProduct({ slug: 'personal-fashion-styling-session', name: 'Personal Fashion Styling & Wardrobe Consultation',
    description: '2-hour 1-on-1 styling session with a professional Nigerian fashion consultant. Personalised outfit advice, wardrobe audit and shopping guide tailored to your body type and budget.',
    price: 25000, stock: 20, categoryId: services.id, vendorId: vendorServices.id,
    imageUrl: img('1525507119028-ed4462154840'),
    tags: ['styling', 'fashion', 'consultation', 'service', 'personal shopping'] })

  await addProduct({ slug: 'generator-repair-maintenance', name: 'Generator Repair & Maintenance Service',
    description: 'On-site repair and servicing for all generator brands: Elemax, Firman, Sumec Firman, Thermocool and more. Oil change, spark plug, carburettor and AVR replacement available.',
    price: 18000, stock: 40, categoryId: services.id, vendorId: vendorServices.id,
    imageUrl: img('1621905251189-08b45d6a269e'),
    tags: ['generator', 'repair', 'maintenance', 'service', 'power'] })

  await addProduct({ slug: 'same-day-grocery-delivery-lagos', name: 'Same-Day Grocery Delivery (Lagos & Abuja)',
    description: 'Order fresh groceries, pantry staples and household essentials online and get them delivered within 4 hours. Available in Lagos Island, Mainland and Abuja.',
    price: 2500, stock: 200, categoryId: services.id, vendorId: vendorServices.id,
    imageUrl: img('1534723452862-4c874018d66d'),
    tags: ['delivery', 'grocery', 'service', 'same-day', 'lagos'] })

  console.log()

  // ── 6. More Phones & Tablets (3) ─────────────────────────────────────────
  console.log('Adding phone products…')
  await addProduct({ slug: 'apple-ipad-10th-gen-64gb', name: 'Apple iPad 10th Generation (Wi-Fi, 64GB)',
    description: 'The all-new iPad with A14 Bionic chip, 10.9-inch Liquid Retina display and USB-C. Perfect for work, school and entertainment. Silver, Blue, Pink and Yellow.',
    price: 385000, stock: 15, categoryId: phones.id, vendorId: vendorTech.id,
    imageUrl: img('1544244015-0df4cec35d8a'), isFeatured: true,
    tags: ['ipad', 'apple', 'tablet', 'ios'] })

  await addProduct({ slug: 'samsung-galaxy-a55-5g-256gb', name: 'Samsung Galaxy A55 5G (8GB RAM, 256GB)',
    description: "Samsung's mid-range powerhouse with a 50MP triple camera, 6.6-inch Super AMOLED display, IP67 water resistance and 5,000mAh battery with 25W fast charging.",
    price: 285000, comparePrice: 310000, stock: 25, categoryId: phones.id, vendorId: vendorTech.id,
    imageUrl: img('1610945415114-8afba55f8c92'), isFlashSale: true, flashSalePrice: 265000,
    tags: ['samsung', '5g', 'android', 'phone'] })

  await addProduct({ slug: 'tecno-spark-20-pro-plus', name: 'Tecno Spark 20 Pro+ (8GB+8GB, 256GB)',
    description: 'The Tecno Spark 20 Pro+ features a 6.78-inch FHD+ display, 108MP main camera, 8GB+8GB extended RAM, and a massive 5,000mAh battery.',
    price: 145000, stock: 40, categoryId: phones.id, vendorId: vendorTech.id,
    imageUrl: img('1511707171634-5f897ff02aa9'),
    tags: ['tecno', 'spark', 'android', 'budget'] })

  console.log()

  // ── 7. More Electronics (3) ──────────────────────────────────────────────
  console.log('Adding electronics products…')
  await addProduct({ slug: 'midea-1-5hp-inverter-split-ac', name: 'Midea 1.5HP Inverter Split Air Conditioner',
    description: 'Energy-saving inverter technology reduces electricity consumption by up to 60%. Fast cooling, ultra-quiet, Wi-Fi control and self-cleaning filter. Covers up to 18sqm.',
    price: 285000, comparePrice: 320000, stock: 20, categoryId: electronics.id, vendorId: vendorTech.id,
    imageUrl: img('1581578731548-c64695cc6952'), isFeatured: true,
    tags: ['AC', 'air conditioner', 'inverter', 'midea', 'cooling'] })

  await addProduct({ slug: 'hisense-55-4k-smart-tv', name: 'Hisense 55″ 4K UHD Smart TV (55A7K)',
    description: 'Vivid 4K Ultra HD picture with VIDAA Smart OS. Access Netflix, YouTube, Prime Video and more. Dolby Vision HDR, DTS Virtual:X audio and Google Assistant.',
    price: 420000, stock: 12, categoryId: electronics.id, vendorId: vendorTech.id,
    imageUrl: img('1593359677715-3c7e9f61a30e'),
    tags: ['TV', 'smart tv', 'hisense', '4K', 'entertainment'] })

  await addProduct({ slug: 'professional-18inch-ring-light', name: 'Professional 18″ Ring Light with Tripod Stand',
    description: '18-inch LED ring light, adjustable colour temperature 3200K–5500K, 10 brightness levels, 2m tripod stand and phone holder. Ideal for content creators and live streaming.',
    price: 35000, comparePrice: 42000, stock: 50, categoryId: electronics.id, vendorId: vendorTech.id,
    imageUrl: img('1551650975-87deedd944c3'),
    tags: ['ring light', 'studio', 'photography', 'content creator'] })

  console.log()

  // ── 8. More Fashion (3) ───────────────────────────────────────────────────
  console.log('Adding fashion products…')
  await addProduct({ slug: 'mens-classic-3piece-suit-navy', name: "Men's Classic 3-Piece Suit – Navy Blue",
    description: 'Sharp tailored 3-piece suit in premium navy wool-blend fabric. Includes jacket, waistcoat and slim-fit trousers. Perfect for weddings, corporate events and formal occasions.',
    price: 95000, stock: 30, categoryId: fashionMen?.id ?? fashion.id, vendorId: vendorFashion.id,
    imageUrl: img('1507679799987-c73779587ccf'), isFeatured: true,
    tags: ['suit', "men's fashion", 'formal', 'wedding'] })

  await addProduct({ slug: 'womens-silk-wrap-dress-floral', name: "Women's Silk Wrap Dress – Floral Print",
    description: 'Elegant wrap-style dress in lightweight satin-silk blend. Midi length, adjustable waist tie, V-neckline. Sizes XS–3XL. Perfect for dinner dates and beach occasions.',
    price: 42000, stock: 45, categoryId: fashionWomen?.id ?? fashion.id, vendorId: vendorFashion.id,
    imageUrl: img('1496747611176-887ecca5b9b0'),
    tags: ["women's fashion", 'dress', 'silk', 'formal'] })

  await addProduct({ slug: 'unisex-chunky-sole-sneakers-white', name: 'Unisex Chunky Sole Sneakers – White',
    description: 'Trendy chunky platform sneakers with padded ankle collar, thick rubber sole and breathable mesh upper. Streetwear and casual outings. Sizes 36–46.',
    price: 28000, comparePrice: 35000, stock: 60, categoryId: fashionFootwear?.id ?? fashion.id, vendorId: vendorFashion.id,
    imageUrl: img('1542291026-7eec264c27ff'),
    tags: ['sneakers', 'footwear', 'unisex', 'streetwear'] })

  console.log()

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = await prisma.product.count({ where: { status: 'approved', isActive: true } })
  console.log(`🎉 Demo seed 3 complete! Total live products: ${total}`)
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

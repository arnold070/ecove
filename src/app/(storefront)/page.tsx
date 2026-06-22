import { Metadata } from 'next'
import HomepageClient from './HomepageClient'

export const metadata: Metadata = {
  title: "Ecove – Nigeria's Online Marketplace | Shop Smart, Live Better",
  description: 'Shop electronics, fashion, home appliances, phones, beauty products and more at the best prices in Nigeria. Fast delivery nationwide.',
}

async function getData() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  try {
    const [productsRes, categoriesRes, flashSaleRes, bestSellersRes, newestRes, fashionRes, bannersRes, statsRes] = await Promise.all([
      fetch(`${base}/api/storefront/products?featured=true&limit=12`,         { next: { revalidate: 300 } }),
      fetch(`${base}/api/storefront/categories?limit=20&includeChildren=true`,{ next: { revalidate: 600 } }),
      fetch(`${base}/api/storefront/products?flashSale=true&limit=6`,         { next: { revalidate: 60  } }),
      fetch(`${base}/api/storefront/products?bestSeller=true&limit=6`,        { next: { revalidate: 300 } }),
      fetch(`${base}/api/storefront/products?sort=newest&limit=6`,            { next: { revalidate: 120 } }),
      fetch(`${base}/api/storefront/products?parentCategory=fashion&limit=6`, { next: { revalidate: 300 } }),
      fetch(`${base}/api/storefront/banners`,                                 { next: { revalidate: 300 } }),
      fetch(`${base}/api/storefront/stats`,                                   { next: { revalidate: 600 } }),
    ])
    const [featuredData, categoriesData, flashSaleData, bestSellersData, newestData, fashionData, bannersData, statsData] = await Promise.all([
      productsRes.ok     ? productsRes.json()     : { data: [] },
      categoriesRes.ok   ? categoriesRes.json()   : { data: [] },
      flashSaleRes.ok    ? flashSaleRes.json()    : { data: [] },
      bestSellersRes.ok  ? bestSellersRes.json()  : { data: [] },
      newestRes.ok       ? newestRes.json()        : { data: [] },
      fashionRes.ok      ? fashionRes.json()       : { data: [] },
      bannersRes.ok      ? bannersRes.json()       : { data: [] },
      statsRes.ok        ? statsRes.json()         : { vendorCount: 184, productCount: 200 },
    ])
    return {
      featured:     featuredData.data    || [],
      categories:   categoriesData.data  || [],
      flashSale:    flashSaleData.data   || [],
      bestSellers:  bestSellersData.data || [],
      newest:       newestData.data      || [],
      fashion:      fashionData.data     || [],
      banners:      bannersData.data     || [],
      vendorCount:  statsData.vendorCount  || 184,
      productCount: statsData.productCount || 200,
    }
  } catch {
    return {
      featured: [], categories: [], flashSale: [], bestSellers: [],
      newest: [], fashion: [], banners: [], vendorCount: 184, productCount: 200,
    }
  }
}

export default async function HomePage() {
  const { featured, categories, flashSale, bestSellers, newest, fashion, banners, vendorCount, productCount } = await getData()
  return (
    <HomepageClient
      featured={featured}
      categories={categories}
      flashSale={flashSale}
      bestSellers={bestSellers}
      newest={newest}
      fashion={fashion}
      banners={banners}
      vendorCount={vendorCount}
      productCount={productCount}
    />
  )
}

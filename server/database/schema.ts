import { pgTable, serial, text, real, integer, timestamp } from 'drizzle-orm/pg-core'

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'yarn' | 'hook'
  subcategory: text('subcategory'),
  description: text('description'),
  imageUrl: text('image_url'),
  priceRange: text('price_range'),
  rating: real('rating').default(0),
  ratingCount: integer('rating_count').default(0),
  rank: integer('rank').default(0),
  recommendReason: text('recommend_reason'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const productLinks = pgTable('product_links', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  url: text('url').notNull(),
  price: text('price'),
})

export const resources = pgTable('resources', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'pattern' | 'video'
  category: text('category').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  fileUrl: text('file_url'),
  videoUrl: text('video_url'),
  platform: text('platform'),
  author: text('author'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(), // 'showcase' | 'help' | 'experience' | 'exchange'
  authorName: text('author_name').notNull(),
  images: text('images'), // JSON array string
  likes: integer('likes').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  authorName: text('author_name').notNull(),
  likes: integer('likes').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

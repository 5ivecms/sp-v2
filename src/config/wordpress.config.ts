import { registerAs } from '@nestjs/config'

export default registerAs('wordpress', () => ({
  domain: process.env.WORDPRESS_DOMAIN,
  threads: process.env.WORDPRESS_THREADS,
  keywordsPerTread: process.env.KEYWORDS_PER_THREAD,
}))

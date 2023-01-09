import { registerAs } from '@nestjs/config'

export default registerAs('searchEngine', () => ({
  searchEngine: process.env.SEARCH_ENGINE || 'mail',
}))

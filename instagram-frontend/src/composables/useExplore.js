import { useInfiniteScroll } from './useInfiniteScroll'
import { exploreService } from '@/services/exploreService'
import { EXPLORE_LIMIT } from '@/utils/constants'

export function useExplore() {
  const { items: posts, loading, hasMore, sentinel } =
    useInfiniteScroll(async page => {
      const res = await exploreService.getExplore(page, EXPLORE_LIMIT)
      return res.data
    }, EXPLORE_LIMIT)

  return { posts, loading, hasMore, sentinel }
}

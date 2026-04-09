import { ref } from 'vue'

export function unwrapPagedData(data) {
  if (Array.isArray(data)) {
    return { list: data, total: data.length }
  }
  return {
    list: Array.isArray(data?.list) ? data.list : [],
    total: Number(data?.total || 0)
  }
}

export function usePagedList(defaultPageSize = 10) {
  const list = ref([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(defaultPageSize)

  const setPagedResult = (data) => {
    const { list: rows, total: count } = unwrapPagedData(data)
    list.value = rows
    total.value = count
  }

  const resetPager = () => {
    page.value = 1
  }

  return {
    list,
    loading,
    total,
    page,
    pageSize,
    setPagedResult,
    resetPager
  }
}


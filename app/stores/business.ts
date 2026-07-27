import { defineStore } from 'pinia'

export interface Branch {
  id: string
  name: string
  businessId: string
  isActive: boolean
}

export interface Business {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  isActive: boolean
  branches?: Branch[]
}

export interface BusinessState {
  businesses: Business[]
  branches: Branch[]
  activeBranchId: string | null
  isLoading: boolean
}

export const useBusinessStore = defineStore('business', () => {
  const businesses = ref<Business[]>([])
  const branches = ref<Branch[]>([])
  const branchCookie = useCookie<string>('active_branch_id', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
  const activeBranchId = ref<string | null>(branchCookie.value || null)
  const isLoading = ref(false)

  const activeBranch = computed<Branch | null>(() => {
    if (!activeBranchId.value) return null
    return branches.value.find(b => b.id === activeBranchId.value) || null
  })

  const activeBusiness = computed<Business | null>(() => {
    if (!activeBranchId.value) return null
    const branch = branches.value.find(b => b.id === activeBranchId.value)
    if (!branch) return null
    return businesses.value.find(b => b.id === branch.businessId) || null
  })

  const groupedBusinesses = computed<(Business & { branches: Branch[] })[]>(() => {
    return businesses.value.map(biz => ({
      ...biz,
      branches: branches.value.filter(br => br.businessId === biz.id)
    }))
  })

  const activeGroupedBusinesses = computed<(Business & { branches: Branch[] })[]>(() => {
    return businesses.value
      .filter(biz => biz.isActive)
      .map(biz => ({
        ...biz,
        branches: branches.value.filter(br => br.businessId === biz.id && br.isActive)
      }))
      .filter(biz => biz.branches.length > 0)
  })

  async function fetchAll(forceRefresh = false) {
    if (businesses.value.length === 0) {
      isLoading.value = true
    }
    try {
      const { fetchWithCache } = useCachedFetch()
      const [bizRes, brRes] = await Promise.all([
        fetchWithCache<any>('/businesses', {
          forceRefresh,
          onRevalidated: (fresh) => {
            if (fresh.success) businesses.value = fresh.data
          }
        }),
        fetchWithCache<any>('/branches', {
          forceRefresh,
          onRevalidated: (fresh) => {
            if (fresh.success) branches.value = fresh.data
          }
        })
      ])

      if (bizRes.data?.success) businesses.value = bizRes.data.data
      if (brRes.data?.success) branches.value = brRes.data.data
    } catch (error) {
      console.error('Failed to fetch business data', error)
    } finally {
      isLoading.value = false
    }
  }

  function setBranch(branchId: string) {
    activeBranchId.value = branchId
    branchCookie.value = branchId
  }

  function clearBranch() {
    activeBranchId.value = null
    branchCookie.value = null
  }

  async function addBusiness(data: any) {
    const { fetchWithAuth } = useApi()
    const { invalidateCache } = useCachedFetch()
    const res = await fetchWithAuth<any>('/businesses', {
      method: 'POST',
      body: data
    })
    if (res.success) {
      invalidateCache('/businesses')
      await fetchAll(true)
    }
    return res
  }

  async function addBranch(data: { name: string, businessId: string }) {
    const { fetchWithAuth } = useApi()
    const { invalidateCache } = useCachedFetch()
    const res = await fetchWithAuth<any>('/branches', {
      method: 'POST',
      body: data
    })
    if (res.success) {
      invalidateCache('/branches')
      await fetchAll(true)
    }
    return res
  }

  async function toggleBusinessStatus(businessId: string) {
    try {
      const { fetchWithAuth } = useApi()
      const { invalidateCache } = useCachedFetch()
      const response = await fetchWithAuth<any>(`/businesses/${businessId}/toggle`, {
        method: 'PATCH'
      })
      if (response.success) {
        invalidateCache('/businesses')
        const business = businesses.value.find(b => b.id === businessId)
        if (business) {
          business.isActive = response.data.isActive
        }
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  async function toggleBranchStatus(branchId: string) {
    try {
      const { fetchWithAuth } = useApi()
      const { invalidateCache } = useCachedFetch()
      const response = await fetchWithAuth<any>(`/branches/${branchId}/toggle`, {
        method: 'PATCH'
      })
      if (response.success) {
        invalidateCache('/branches')
        const branch = branches.value.find(b => b.id === branchId)
        if (branch) {
          branch.isActive = response.data.isActive
        }
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  async function deleteBusiness(businessId: string) {
    try {
      const { fetchWithAuth } = useApi()
      const { invalidateCache } = useCachedFetch()
      const res = await fetchWithAuth<any>(`/businesses/${businessId}`, {
        method: 'DELETE'
      })
      if (res.success) {
        invalidateCache('/businesses')
        invalidateCache('/branches')
        await fetchAll(true)
      }
      return res
    } catch (error: any) {
      return {
        success: false,
        message: error.data?.message || error.message || 'Gagal menghapus bisnis'
      }
    }
  }

  async function deleteBranch(branchId: string) {
    try {
      const { fetchWithAuth } = useApi()
      const { invalidateCache } = useCachedFetch()
      const res = await fetchWithAuth<any>(`/branches/${branchId}`, {
        method: 'DELETE'
      })
      if (res.success) {
        invalidateCache('/branches')
        await fetchAll(true)
      }
      return res
    } catch (error: any) {
      return {
        success: false,
        message: error.data?.message || error.message || 'Gagal menghapus cabang'
      }
    }
  }

  return {
    businesses,
    branches,
    activeBranchId,
    isLoading,
    activeBranch,
    activeBusiness,
    groupedBusinesses,
    activeGroupedBusinesses,
    fetchAll,
    setBranch,
    clearBranch,
    addBusiness,
    addBranch,
    toggleBusinessStatus,
    toggleBranchStatus,
    deleteBusiness,
    deleteBranch
  }
})

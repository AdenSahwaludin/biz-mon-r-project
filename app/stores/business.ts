import { defineStore } from 'pinia'

export interface Branch {
  id: string
  name: string
  businessId: string
  isActive: boolean
  business: Business
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

export const useBusinessStore = defineStore('business', {
  state: () => ({
    businesses: [] as Business[],
    branches: [] as Branch[],
    activeBranchId: useCookie('active_branch_id').value || null as string | null,
    isLoading: false
  }),
  getters: {
    activeBranch: (state) => {
      if (!state.activeBranchId) return null
      return state.branches.find(b => b.id === state.activeBranchId) || null
    },
    activeBusiness: (state): Business | null => {
      if (!state.activeBranchId) return null
      const branch = state.branches.find(b => b.id === state.activeBranchId)
      return branch ? branch.business : null
    },
    groupedBusinesses: (state) => {
      // Return businesses with their branches
      return state.businesses.map(biz => {
        return {
          ...biz,
          branches: state.branches.filter(br => br.businessId === biz.id)
        }
      })
    }
  },
  actions: {
    async fetchAll() {
      this.isLoading = true
      try {
        const { fetchWithAuth } = useApi()
        const [bizRes, brRes] = await Promise.all([
          fetchWithAuth<any>('/businesses'),
          fetchWithAuth<any>('/branches')
        ])
        
        if (bizRes.success) this.businesses = bizRes.data
        if (brRes.success) this.branches = brRes.data
      } catch (error) {
        console.error('Failed to fetch business data', error)
      } finally {
        this.isLoading = false
      }
    },
    
    setBranch(branchId: string) {
      this.activeBranchId = branchId
      useCookie('active_branch_id').value = branchId
    },

    clearBranch() {
      this.activeBranchId = null
      useCookie('active_branch_id').value = null
    },

    async addBusiness(data: any) {
      const { fetchWithAuth } = useApi()
      const res = await fetchWithAuth<any>('/businesses', {
        method: 'POST',
        body: data
      })
      if (res.success) {
        await this.fetchAll()
      }
      return res
    },

    async addBranch(data: { name: string, businessId: string }) {
      const { fetchWithAuth } = useApi()
      const res = await fetchWithAuth<any>('/branches', {
        method: 'POST',
        body: data
      })
      if (res.success) {
        await this.fetchAll()
      }
      return res
    },

    async toggleBranchStatus(branchId: string) {
      try {
        const { fetchWithAuth } = useApi()
        const response = await fetchWithAuth<any>(`/branches/${branchId}/toggle`, {
          method: 'PATCH'
        })
        if (response.success) {
          const branch = this.branches.find(b => b.id === branchId)
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
  }
})

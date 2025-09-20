interface UserData {
  id: string
  email: string
  name: string
  first_name: string
  last_name: string
  phone?: string
  user_type?: string
  city?: string
  suburb?: string
  password: string // hashed
  role: string
  subscription_tier?: 'basic' | 'advanced' | 'pro' | 'enterprise'
  createdAt: Date
  updatedAt: Date
  emailVerified: boolean
  resetToken?: string
  resetTokenExpiry?: Date
}

interface BusinessData {
  id: string
  userId: string
  name: string
  description: string
  category: string
  location: string
  contactEmail: string
  contactPhone: string
  website?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

// In-memory storage (replace with database in production)
const users = new Map<string, UserData>()
const businesses = new Map<string, BusinessData>()
const usersByEmail = new Map<string, string>() // email -> userId mapping

// User management functions
export const userStore = {
  // Create user
  async createUser(userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserData> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    
    // Auto-generate name from first_name and last_name if not provided
    const name = userData.name || `${userData.first_name} ${userData.last_name}`
    
    const user: UserData = {
      ...userData,
      name,
      id,
      createdAt: now,
      updatedAt: now
    }
    
    users.set(id, user)
    usersByEmail.set(userData.email.toLowerCase(), id)
    
    return user
  },

  // Get user by ID
  async getUserById(id: string): Promise<UserData | null> {
    return users.get(id) || null
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<UserData | null> {
    const userId = usersByEmail.get(email.toLowerCase())
    if (!userId) return null
    return users.get(userId) || null
  },

  // Update user
  async updateUser(id: string, updates: Partial<UserData>): Promise<UserData | null> {
    const user = users.get(id)
    if (!user) return null
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    }
    
    users.set(id, updatedUser)
    
    // Update email mapping if email changed
    if (updates.email && updates.email !== user.email) {
      usersByEmail.delete(user.email.toLowerCase())
      usersByEmail.set(updates.email.toLowerCase(), id)
    }
    
    return updatedUser
  },

  // Delete user
  async deleteUser(id: string): Promise<boolean> {
    const user = users.get(id)
    if (!user) return false
    
    users.delete(id)
    usersByEmail.delete(user.email.toLowerCase())
    return true
  },

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    return usersByEmail.has(email.toLowerCase())
  },

  // Get all users (admin function)
  async getAllUsers(): Promise<UserData[]> {
    return Array.from(users.values())
  },

  // Find by email (synchronous version for compatibility)
  findByEmail(email: string): UserData | null {
    const userId = usersByEmail.get(email.toLowerCase())
    if (!userId) return null
    return users.get(userId) || null
  },

  // Create user (synchronous version for compatibility)
  createUser(userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): UserData {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    
    const user: UserData = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now
    }
    
    users.set(id, user)
    usersByEmail.set(userData.email.toLowerCase(), id)
    
    return user
  },

  // Get dashboard route based on user type and subscription
  getDashboardRoute(user: any): string {
    if (user.role === 'admin') {
      return '/admin'
    }
    
    if (user.subscription_tier === 'enterprise' || user.user_type === 'provider') {
      return '/dashboard'
    }
    
    return '/client'
  }
}

// Business management functions
export const businessStore = {
  // Create business
  async createBusiness(businessData: Omit<BusinessData, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessData> {
    const id = `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    
    const business: BusinessData = {
      ...businessData,
      id,
      createdAt: now,
      updatedAt: now
    }
    
    businesses.set(id, business)
    return business
  },

  // Get business by ID
  async getBusinessById(id: string): Promise<BusinessData | null> {
    return businesses.get(id) || null
  },

  // Get businesses by user ID
  async getBusinessesByUserId(userId: string): Promise<BusinessData[]> {
    return Array.from(businesses.values()).filter(business => business.userId === userId)
  },

  // Update business
  async updateBusiness(id: string, updates: Partial<BusinessData>): Promise<BusinessData | null> {
    const business = businesses.get(id)
    if (!business) return null
    
    const updatedBusiness = {
      ...business,
      ...updates,
      updatedAt: new Date()
    }
    
    businesses.set(id, updatedBusiness)
    return updatedBusiness
  },

  // Delete business
  async deleteBusiness(id: string): Promise<boolean> {
    return businesses.delete(id)
  },

  // Get all businesses (admin function)
  async getAllBusinesses(): Promise<BusinessData[]> {
    return Array.from(businesses.values())
  },

  // Get businesses by status
  async getBusinessesByStatus(status: BusinessData['status']): Promise<BusinessData[]> {
    return Array.from(businesses.values()).filter(business => business.status === status)
  }
}

// Payment/transaction storage (basic)
interface PaymentData {
  id: string
  userId: string
  businessId?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod: string
  paypalOrderId?: string
  paypalPaymentId?: string
  createdAt: Date
  updatedAt: Date
}

const payments = new Map<string, PaymentData>()

export const paymentStore = {
  // Create payment record
  async createPayment(paymentData: Omit<PaymentData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentData> {
    const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    
    const payment: PaymentData = {
      ...paymentData,
      id,
      createdAt: now,
      updatedAt: now
    }
    
    payments.set(id, payment)
    return payment
  },

  // Get payment by ID
  async getPaymentById(id: string): Promise<PaymentData | null> {
    return payments.get(id) || null
  },

  // Get payment by PayPal order ID
  async getPaymentByOrderId(orderId: string): Promise<PaymentData | null> {
    return Array.from(payments.values()).find(payment => payment.paypalOrderId === orderId) || null
  },

  // Update payment
  async updatePayment(id: string, updates: Partial<PaymentData>): Promise<PaymentData | null> {
    const payment = payments.get(id)
    if (!payment) return null
    
    const updatedPayment = {
      ...payment,
      ...updates,
      updatedAt: new Date()
    }
    
    payments.set(id, updatedPayment)
    return updatedPayment
  },

  // Get payments by user
  async getPaymentsByUserId(userId: string): Promise<PaymentData[]> {
    return Array.from(payments.values()).filter(payment => payment.userId === userId)
  }
}
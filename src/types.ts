export type Product = {
  id: string
  name: string
  description: string
  specification: string | null
  price: number
  category: string
  image_url: string | null
  featured: boolean
  created_at?: string
}

export type CartItem = {
  product: Product
  quantity: number
}

export type CheckoutCustomer = {
  fullName: string
  phone: string
  email: string
  address: string
}

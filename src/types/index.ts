// Common types
export interface BaseEntity {
  id: string; // MongoDB ObjectId as string
  created_at?: string;
  updated_at?: string;
}

// Vendor types
export interface Vendor extends BaseEntity {
  name: string;
  gst_number?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
}

export interface VendorLedger extends BaseEntity {
  vendor_id: string;
  transaction_date: string;
  reference_type: string;
  reference_id: string;
  debit: number;
  credit: number;
  balance: number;
}

// Customer types
export interface Customer extends BaseEntity {
  name: string;
  gst_number?: string;
  phone?: string;
  address?: string;
}

export interface CustomerLedger extends BaseEntity {
  customer_id: string;
  transaction_date: string;
  reference_type: string;
  reference_id: string;
  debit: number;
  credit: number;
  balance: number;
}

// Product types
export interface Product extends BaseEntity {
  name: string;
  category?: string;
  color?: string;
  design?: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  status: 'active' | 'inactive';
}

// Inventory types
export interface Inventory {
  product_id: string;
  quantity_available: number;
  product?: Product;
}

export interface StockMovement extends BaseEntity {
  product_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  date: string;
  product?: Product;
}

// Purchase types
export interface Purchase extends BaseEntity {
  vendor_id: string;
  invoice_no: string;
  invoice_date: string;
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'partial';
  vendor?: Vendor;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  purchase_id?: string;
  product_id: string;
  quantity: number;
  rate: number;
  product?: Product;
}

// Sales types
export interface Sale extends BaseEntity {
  invoice_no: string;
  customer_id?: string;
  invoice_date: string;
  subtotal: number;
  gst_amount: number;
  discount: number;
  total_amount: number;
  payment_type: 'cash' | 'credit';
  customer?: Customer;
  items?: SaleItem[];
}

export interface SaleItem {
  sale_id?: string;
  product_id: string;
  quantity: number;
  rate: number;
  product?: Product;
}

// Returns types
export interface Return extends BaseEntity {
  type: 'sales' | 'purchase';
  reference_invoice_id: string;
  date: string;
  total_amount: number;
  items?: ReturnItem[];
}

export interface ReturnItem {
  return_id?: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

// Payment types
export interface Payment extends BaseEntity {
  reference_type: 'vendor' | 'customer';
  reference_id: string;
  amount: number;
  payment_mode: 'cash' | 'bank' | 'cheque' | 'online';
  payment_date: string;
}

// Settings types
export interface Settings {
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  gst_number?: string;
  tax_rate?: number;
  invoice_prefix?: string;
  [key: string]: any;
}

// Master Data types
export interface Category extends BaseEntity {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface Color extends BaseEntity {
  name: string;
  hex_code?: string;
  status: 'active' | 'inactive';
}


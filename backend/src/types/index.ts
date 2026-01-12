
export interface PurchaseItemDTO {
    product_id: string;
    quantity: number;
    rate: number;
}

export interface CreatePurchaseDTO {
    vendor_id: string;
    invoice_no: string;
    invoice_date: string;
    items: PurchaseItemDTO[];
    payment_status?: 'pending' | 'paid' | 'partial';
}

export interface UpdatePurchaseDTO extends Partial<CreatePurchaseDTO> { }

export interface SaleItemDTO {
    product_id: string;
    quantity: number;
    rate: number;
}

export interface CreateSaleDTO {
    customer_id?: string;
    invoice_no: string;
    invoice_date: string;
    items: SaleItemDTO[];
    discount?: number;
    payment_type?: 'cash' | 'credit';
}

export interface UpdateSaleDTO extends Partial<CreateSaleDTO> { }

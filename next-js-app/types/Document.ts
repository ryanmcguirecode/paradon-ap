export const azureInvoiceFields = {
  CustomerName: "Invoiced customer",
  CustomerId: "Customer reference ID",
  PurchaseOrder: "Purchase order reference number",
  InvoiceId: "ID for this specific invoice (often Invoice Number)",
  InvoiceDate: "Date the invoice was issued",
  DueDate: "Date payment for this invoice is due",
  VendorName: "Vendor who created this invoice",
  VendorAddress: "Vendor mailing address",
  VendorAddressRecipient: "Name associated with the VendorAddress",
  CustomerAddress: "Mailing address for the Customer",
  CustomerAddressRecipient: "Name associated with the CustomerAddress",
  BillingAddress: "Explicit billing address for the customer",
  BillingAddressRecipient: "Name associated with the BillingAddress",
  ShippingAddress: "Explicit shipping address for the customer",
  ShippingAddressRecipient: "Name associated with the ShippingAddress",
  SubTotal: "Subtotal field identified on this invoice",
  TotalDiscount: "The total discount applied to an invoice",
  TotalTax: "Total tax field identified on this invoice",
  InvoiceTotal: "Total tax field identified on this invoice",
  AmountDue: "Total Amount Due to the vendor",
  PreviousUnpaidBalance: "Explicit previously unpaid balance",
  RemittanceAddress: "Explicit remittance or payment address for the customer",
  RemittanceAddressRecipient: "Name associated with the RemittanceAddress",
  ServiceAddress:
    "Explicit service address or property address for the customer",
  ServiceAddressRecipient: "Name associated with the ServiceAddress",
  ServiceStartDate:
    "First date for the service period (for example, a utility bill service period)",
  ServiceEndDate:
    "End date for the service period (for example, a utility bill service period)",
  VendorTaxId: "The taxpayer number associated with the vendor",
  CustomerTaxId: "The taxpayer number associated with the customer",
  PaymentTerm: "The terms of payment for the invoice",
  CurrencyCode: "	The currency code associated with the extracted amount",
  PaymentDetails: "Payment Option details (e.g. Net 30)",
  TaxDetails: "Tax details (e.g. amount and rate)",
};
type AzureInvoiceField = keyof typeof azureInvoiceFields;

export interface DocumentField {
  page: number;
  id: string;
  displayName: string;
  kind: "string" | "number" | "date" | "currency";
  color: [number, number, number];
  modelField?: AzureInvoiceField | null;
}

export interface Document {
  id: string;
  displayName: string;
  fields?: DocumentField[];
}

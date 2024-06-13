const azureInvoiceFields = {
  customerName: "Invoiced customer",
  customerId: "Customer reference ID",
  purchaseOrder: "Purchase order reference number",
  invoiceId: "ID for this specific invoice (often Invoice Number)",
  invoiceDate: "Date the invoice was issued",
  dueDate: "Date payment for this invoice is due",
  vendorName: "Vendor who created this invoice",
  vendorAddress: "Vendor mailing address",
  vendorAddressRecipient: "Name associated with the VendorAddress",
  customerAddress: "Mailing address for the Customer",
  customerAddressRecipient: "Name associated with the CustomerAddress",
  billingAddress: "Explicit billing address for the customer",
  billingAddressRecipient: "Name associated with the BillingAddress",
  shippingAddress: "Explicit shipping address for the customer",
  shippingAddressRecipient: "Name associated with the ShippingAddress",
  subTotal: "Subtotal field identified on this invoice",
  totalDiscount: "The total discount applied to an invoice",
  totalTax: "Total tax field identified on this invoice",
  invoiceTotal: "Total tax field identified on this invoice",
  amountDue: "Total Amount Due to the vendor",
  previousUnpaidBalance: "Explicit previously unpaid balance",
  remittanceAddress: "Explicit remittance or payment address for the customer",
  remittanceAddressRecipient: "Name associated with the RemittanceAddress",
  serviceAddress:
    "Explicit service address or property address for the customer",
  serviceAddressRecipient: "Name associated with the ServiceAddress",
  serviceStartDate:
    "First date for the service period (for example, a utility bill service period)",
  serviceEndDate:
    "End date for the service period (for example, a utility bill service period)",
  vendorTaxId: "The taxpayer number associated with the vendor",
  customerTaxId: "The taxpayer number associated with the customer",
  paymentTerm: "The terms of payment for the invoice",
  currencyCode: "	The currency code associated with the extracted amount",
  paymentDetails: "Payment Option details (e.g. Net 30)",
  taxDetails: "Tax details (e.g. amount and rate)	",
};
type AzureInvoiceField = keyof typeof azureInvoiceFields;

export interface Field {
  id: string;
  displayName: string;
  kind: "string" | "number" | "date" | "currency";
  modelField?: AzureInvoiceField | null;
}

export default interface Document {
  documentTypeId: string;
  displayName: string;
  color: [number, number, number];
  model?: "azure-invoice" | null;
  fields?: Field[];
}

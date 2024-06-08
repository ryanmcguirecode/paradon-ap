import Field from "@/components/Field";

export const fields: Field[] = [
  {
    name: "Vendor Name",
    type: "string",
    databaseId: "vendorName",
    azureId: "VendorName",
    color: [255, 102, 102],
  },
  {
    name: "Vendor Number",
    type: "number",
    color: [255, 102, 102],
  },
  {
    name: "Customer Name",
    type: "string",
    databaseId: "shippingAddressRecipient",
    azureId: "ShippingAddressRecipient",
    color: [204, 153, 255],
  },
  {
    name: "Customer Number",
    type: "number",
    color: [204, 153, 255],
  },
  {
    name: "Invoice Number",
    type: "string",
    databaseId: "invoiceId",
    azureId: "InvoiceId",
    color: [102, 178, 255],
  },
  {
    name: "PO Number",
    type: "string",
    databaseId: "purchaseOrder",
    azureId: "PurchaseOrder",
    color: [245, 144, 66],
  },
  {
    name: "Invoice Date",
    type: "date",
    databaseId: "invoiceDate",
    azureId: "InvoiceDate",
    color: [222, 184, 135],
  },
  {
    name: "Original Invoice Amount",
    type: "currency",
    databaseId: "invoiceTotal",
    azureId: "InvoiceTotal",
    color: [232, 232, 21],
  },
  {
    name: "Sales Tax",
    type: "currency",
    databaseId: "totalTax",
    azureId: "TotalTax",
    color: [102, 255, 102],
  },
  {
    name: "Freight",
    type: "currency",
    color: [0, 153, 76],
  },
  {
    name: "Payment Terms",
    type: "string",
    databaseId: "paymentTerm",
    azureId: "PaymentTerm",
    color: [142, 142, 142],
  },
];

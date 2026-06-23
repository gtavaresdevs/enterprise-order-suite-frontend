import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { Order, OrderStatus, OrderFilter } from "@/types/orders";

export const STATUS_CONFIG: Record<OrderStatus, { pill: string; dot: string; Icon: React.ElementType }> = {
  Pending: { pill: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-400", Icon: Clock },
  Processing: { pill: "text-blue-700 bg-blue-50 border-blue-200", dot: "bg-blue-500", Icon: Loader2 },
  Completed: { pill: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2 },
  Cancelled: { pill: "text-red-700 bg-red-50 border-red-200", dot: "bg-red-400", Icon: XCircle },
};

export const FILTERS: OrderFilter[] = ["All", "Pending", "Processing", "Completed", "Cancelled"];

export const REGIONS = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East & Africa"];

export const ORDERS: Order[] = [
  {
    id: "ORD-2024-9041",
    customer: "Marcus Whitfield",
    company: "Nexus Dynamics Ltd.",
    email: "m.whitfield@nexusdyn.com",
    region: "North America",
    products: [
      { id: "PRD-0041", name: "Enterprise SSD Array 4TB", sku: "SSD-ENTR-4TB", quantity: 12, unitPrice: 849.0, inStock: true, stockQty: 84 },
      { id: "PRD-0087", name: "Rack Mount Cable Mgmt 2U", sku: "CAB-RACK-2U", quantity: 8, unitPrice: 124.5, inStock: true, stockQty: 210 },
    ],
    dateCreated: "2024-11-14",
    total: 11188.0,
    status: "Completed",
  },
  {
    id: "ORD-2024-9042",
    customer: "Serena Kato",
    company: "Apex Logistics Group",
    email: "s.kato@apexlog.io",
    region: "Europe",
    products: [
      { id: "PRD-0021", name: "Industrial UPS System 10kVA", sku: "UPS-IND-10K", quantity: 3, unitPrice: 2340.0, inStock: true, stockQty: 12 },
      { id: "PRD-0033", name: "Network Switch 48-Port", sku: "NSW-48P-ENT", quantity: 6, unitPrice: 1250.0, inStock: false, stockQty: 0 },
    ],
    dateCreated: "2024-11-15",
    total: 14520.0,
    status: "Processing",
  },
  {
    id: "ORD-2024-9043",
    customer: "Daniel Osei",
    company: "Stratos Capital Partners",
    email: "d.osei@stratos-cp.com",
    region: "Asia Pacific",
    products: [
      { id: "PRD-0055", name: "Thermal Server Rack 42U", sku: "RACK-42U-CLG", quantity: 2, unitPrice: 3800.0, inStock: true, stockQty: 7 },
    ],
    dateCreated: "2024-11-16",
    total: 7600.0,
    status: "Pending",
  },
  {
    id: "ORD-2024-9044",
    customer: "Ingrid Solberg",
    company: "Nordic Freight Systems",
    email: "i.solberg@nordicfreight.no",
    region: "Europe",
    products: [
      { id: "PRD-0011", name: "Fiber Optic Cable Spool 500m", sku: "FBR-500M-SM", quantity: 20, unitPrice: 312.0, inStock: true, stockQty: 140 },
      { id: "PRD-0062", name: "Patch Panel 24-Port Cat6A", sku: "PPL-24P-C6A", quantity: 15, unitPrice: 89.0, inStock: true, stockQty: 300 },
      { id: "PRD-0078", name: "Cable Tester Pro", sku: "TST-CAB-PRO", quantity: 4, unitPrice: 445.0, inStock: false, stockQty: 0 },
    ],
    dateCreated: "2024-11-17",
    total: 9115.0,
    status: "Processing",
  },
  {
    id: "ORD-2024-9045",
    customer: "Ravi Mehta",
    company: "Horizon Cloud Technologies",
    email: "r.mehta@horizoncloud.in",
    region: "Asia Pacific",
    products: [
      { id: "PRD-0091", name: "Blade Server Module E7", sku: "SRV-BLDE-E7", quantity: 5, unitPrice: 6200.0, inStock: true, stockQty: 23 },
    ],
    dateCreated: "2024-11-18",
    total: 31000.0,
    status: "Pending",
  },
  {
    id: "ORD-2024-9046",
    customer: "Camille Fontaine",
    company: "Meridian Retail Corp.",
    email: "c.fontaine@meridianretail.fr",
    region: "Europe",
    products: [
      { id: "PRD-0044", name: "POS Terminal Bundle Pro", sku: "POS-BNDL-PRO", quantity: 30, unitPrice: 675.0, inStock: true, stockQty: 55 },
      { id: "PRD-0050", name: "Receipt Printer Thermal", sku: "PRT-RCP-THM", quantity: 30, unitPrice: 189.0, inStock: true, stockQty: 88 },
    ],
    dateCreated: "2024-11-12",
    total: 25920.0,
    status: "Cancelled",
  },
  {
    id: "ORD-2024-9047",
    customer: "Thomas Brewer",
    company: "Lakeside Manufacturing",
    email: "t.brewer@lakesidemfg.com",
    region: "North America",
    products: [
      { id: "PRD-0019", name: "Industrial IoT Gateway", sku: "IOT-GTW-IND", quantity: 8, unitPrice: 1100.0, inStock: true, stockQty: 41 },
      { id: "PRD-0023", name: "Sensor Array Module V3", sku: "SNS-ARR-V3", quantity: 24, unitPrice: 220.0, inStock: true, stockQty: 190 },
    ],
    dateCreated: "2024-11-19",
    total: 14080.0,
    status: "Completed",
  },
  {
    id: "ORD-2024-9048",
    customer: "Yuna Park",
    company: "Kyoto Data Systems",
    email: "y.park@kyotodata.jp",
    region: "Asia Pacific",
    products: [
      { id: "PRD-0066", name: "GPU Compute Module A100", sku: "GPU-A100-80G", quantity: 2, unitPrice: 14500.0, inStock: true, stockQty: 8 },
      { id: "PRD-0074", name: "High-Density Memory 256GB", sku: "MEM-256G-DDR5", quantity: 4, unitPrice: 1840.0, inStock: false, stockQty: 0 },
    ],
    dateCreated: "2024-11-20",
    total: 36360.0,
    status: "Pending",
  },
];

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
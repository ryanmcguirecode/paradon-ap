"use client";
import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/joy/Box";
import Table from "@mui/joy/Table";
import IconButton from "@mui/joy/IconButton";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import NavigationLayout from "@/components/NavigationLayout";
import ReactApexChart from "react-apexcharts";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";

type Vendor = {
  name: string;
  quantity: number;
};

type InvoiceData = {
  series: number[];
  labels: string[];
};

export default function ExecutivePage() {
  const [sortedVendors, setSortedVendors] = useState<Vendor[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { user, loading, level, organization } = useAuth();
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    series: [],
    labels: [],
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const allVendorData = useRef<Vendor[]>([]); // Store all vendors here to manage lazy loading

  useEffect(() => {
    if (!loading && level !== "executive") {
      // Redirect to login page if not an executive
      router.push("/batches");
    }
  }, [loading, level]);

  useEffect(() => {
    async function getExecutiveData() {
      const res = await fetch(
        `/api/executive-metrics?organization=${organization}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const series = Object.values(data.invoiceCountByUser) as number[];
        const labels = Object.keys(data.invoiceCountByUser);
        allVendorData.current = Object.entries(data.invoiceCountByVendor).map(
          ([name, quantity]) => ({ name, quantity: quantity as number })
        );
        setSortedVendors(allVendorData.current.slice(0, 10));
        setInvoiceData({ series, labels });
      }
    }
    if (!loading) {
      getExecutiveData();
    }
  }, [loading]);

  const sortVendors = () => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    const sorted = [...sortedVendors].sort((a, b) =>
      order === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity
    );
    setSortedVendors(sorted);
    setSortOrder(order);
  };

  const loadMoreVendors = () => {
    if (sortedVendors.length < allVendorData.current.length) {
      const moreVendors = allVendorData.current.slice(
        sortedVendors.length,
        sortedVendors.length + 10
      );
      setSortedVendors((prev) => [...prev, ...moreVendors]);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight
    ) {
      loadMoreVendors();
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [sortedVendors]);

  function generateMutedColors(count) {
    const colors = [];
    const baseHue = 200;
    const saturation = 30;
    const lightness = 70;

    for (let i = 0; i < count; i++) {
      const hue = (baseHue + i * (360 / count)) % 360;
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      colors.push(color);
    }
    return colors;
  }

  const mutedColors = generateMutedColors(invoiceData.series.length);

  return (
    <NavigationLayout>
      {invoiceData.series.length > 0 && sortedVendors.length > 0 ? (
        <Box display="flex" justifyContent="space-between">
          <Box width="45%" marginLeft="32px" sx={{ height: "70vh" }}>
            <h2
              style={{
                textAlign: "center",
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 1,
              }}
            >
              Invoice Breakdown by Processor
            </h2>
            <ReactApexChart
              options={{
                labels: invoiceData.labels,
                legend: { position: "bottom" },
                colors: mutedColors,
              }}
              series={invoiceData.series}
              type="pie"
              height="100%"
            />
          </Box>

          <Box
            width="45%"
            ref={containerRef}
            sx={{
              height: "75vh",
              overflowY: "auto",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 1,
              }}
            >
              Invoice Breakdown by Vendor
            </h2>
            <Table>
              <thead>
                <tr
                  style={{
                    position: "sticky",
                    top: "2.5rem",
                    backgroundColor: "white",
                    zIndex: 1,
                  }}
                >
                  <td style={{ fontWeight: 600, fontSize: "1rem" }}>Rank</td>
                  <td style={{ fontWeight: 600, fontSize: "1rem" }}>
                    Vendor Name
                  </td>
                  <td>
                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{ fontWeight: 600, fontSize: "1rem" }}
                    >
                      Quantity
                      <IconButton
                        onClick={sortVendors}
                        size="sm"
                        sx={{ marginLeft: "4px" }}
                      >
                        {sortOrder === "asc" ? (
                          <ArrowUpwardIcon fontSize="small" />
                        ) : (
                          <ArrowDownwardIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                  </td>
                </tr>
              </thead>
              <tbody>
                {sortedVendors.map((vendor, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{vendor.name}</td>
                    <td>{vendor.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Box>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      )}
    </NavigationLayout>
  );
}

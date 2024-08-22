"use client";
import React, { useState, useEffect, useRef, use } from "react";
import Box from "@mui/joy/Box";
import Table from "@mui/joy/Table";
import IconButton from "@mui/joy/IconButton";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import NavigationLayout from "@/components/NavigationLayout";
import ReactApexChart from "react-apexcharts";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

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

const initialVendorData = [
  { name: "Vendor A", quantity: 120 },
  { name: "Vendor B", quantity: 95 },
  { name: "Vendor C", quantity: 85 },
  { name: "Vendor D", quantity: 75 },
  { name: "Vendor E", quantity: 60 },
  { name: "Vendor F", quantity: 50 },
  { name: "Vendor G", quantity: 40 },
  { name: "Vendor H", quantity: 30 },
  { name: "Vendor I", quantity: 20 },
  { name: "Vendor J", quantity: 10 },
  { name: "Vendor K", quantity: 5 },
  { name: "Vendor L", quantity: 1 },
  { name: "Vendor M", quantity: 0 },
  { name: "Vendor N", quantity: 0 },
  { name: "Vendor O", quantity: 0 },
  { name: "Vendor P", quantity: 0 },
  { name: "Vendor Q", quantity: 0 },
  { name: "Vendor R", quantity: 0 },
  { name: "Vendor S", quantity: 0 },
  { name: "Vendor T", quantity: 0 },
  { name: "Vendor U", quantity: 0 },
  { name: "Vendor V", quantity: 0 },
  { name: "Vendor W", quantity: 0 },
  { name: "Vendor X", quantity: 0 },
  { name: "Vendor Y", quantity: 0 },
  { name: "Vendor Z", quantity: 0 },
];

const allVendorData = [...initialVendorData /* Add more data */];

const invoiceData = {
  series: [44, 55, 13, 43, 22], // Example data
  labels: [
    "John Doe",
    "Jane Smith",
    "Mary Johnson",
    "Michael Brown",
    "Emily Davis",
  ],
};

export default function ExecutivePage() {
  const [sortedVendors, setSortedVendors] = useState(initialVendorData);
  const [sortOrder, setSortOrder] = useState("desc");
  const { user, loading, level, organization } = useAuth();
  const router = useRouter();

  const containerRef = useRef(null);

  useEffect(() => {
    if (!loading && level !== "executive") {
      // Redirect to login page if not an executive
      router.push("/batches");
    }
  }, [loading, level]);

  const sortVendors = () => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    const sorted = [...sortedVendors].sort((a, b) =>
      order === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity
    );
    setSortedVendors(sorted);
    setSortOrder(order);
  };

  const loadMoreVendors = () => {
    if (sortedVendors.length < allVendorData.length) {
      const moreVendors = allVendorData.slice(
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

  const mutedColors = generateMutedColors(invoiceData.series.length);

  return (
    <NavigationLayout>
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
            height="100%" // Ensures the chart fills the container
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
    </NavigationLayout>
  );
}

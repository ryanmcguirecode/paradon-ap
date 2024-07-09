"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Option, Select } from "@mui/joy";

function AccuracyChart() {
  const [ChartComponent, setChartComponent] = useState(null);

  // Conditional import of react-apexcharts to fix self not defined error (same as above)
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("react-apexcharts")
        .then((ApexChart) => {
          setChartComponent(() => ApexChart.default);
        })
        .catch((error) =>
          console.error("Failed to load react-apexcharts", error)
        );
    }
  }, []);

  const options = {
    series: [
      {
        name: "Predicted",
        data: [150, 170, 254, 374, 315, 186],
      },
      {
        name: "Actual",
        data: [135, 180, 242, 333, 300, 200],
      },
    ],

    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    xaxis: {
      categories: ["Mar", "Apr", "May", "Jun", "Aug", "Sep"],
      labels: {
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      min: 50,
      labels: {
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
        formatter: function (value, index) {
          // Only show every other label
          return index % 2 === 1 ? value : "";
        },
      },
    },
  };

  return (
    <Box
      sx={{
        border: "1px solid #d7dede",
        backgroundColor: "white",
        borderRadius: "10px",
        padding: "5px",
        backgroundColor: "rgb(249, 251, 254)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 15px 20px 20px",
        }}
      >
        <Typography level="h4" sx={{ fontSize: 25 }}>
          Flip Flop Sales
        </Typography>
        <Select defaultValue="2023" sx={{ height: "40px" }}>
          <Option value="2023">2023</Option>
        </Select>
      </Box>
      {ChartComponent && (
        <ChartComponent
          options={options}
          series={options.series}
          type="line"
          height={350}
          width={500}
        />
      )}
    </Box>
  );
}

export default function SolutionSection() {
  const [RadarComponent, setRadarComponent] = useState(null);

  // Conditional import of react-apexcharts to fix window not defined error
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Importing dynamically and ensuring that we capture the default export correctly
      import("./RadarChart")
        .then((RadarChart) => {
          setRadarComponent(() => RadarChart.default); // Make sure to capture the default export correctly
        })
        .catch((error) => console.error("Failed to load radar chart", error));
    }
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          margin: "auto",
          // backgroundColor: "rgba(241, 249, 253, 0.4)",
          marginTop: "40px",
          border: "1px solid #d7dede",
          borderRadius: "15px",
          boxSizing: "border-box",
          padding: "10px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            // gap: "15px",
          }}
        >
          <Box
            sx={{
              width: 500,
              marginLeft: "30px",
              textAlign: "center",
            }}
          >
            <AccuracyChart />
            <Typography
              sx={{
                fontSize: 22,
                marginTop: "20px",
                marginBottom: "10px",
              }}
            >
              Near Perfect Predictions
            </Typography>
            <Typography
              color="neutral"
              sx={{
                maxWidth: 460,
                paddingLeft: "20px",
                paddingRight: "20px",
                paddingBottom: "10px",
              }}
            >
              We{"'"}ve achieved near-perfect accuracy for our clients, and we
              can do the same for you. We{"'"}ll prove it by running our model
              on your historical sales data.
            </Typography>
          </Box>
          <Box sx={{ width: 500, paddingRight: "13px", textAlign: "center" }}>
            {RadarComponent && <RadarComponent />}
            <Typography
              sx={{
                fontSize: 22,
                marginTop: "20px",
                marginBottom: "10px",
              }}
            >
              Reality Modeling
            </Typography>
            <Typography
              color="neutral"
              sx={{
                maxWidth: 460,
                paddingLeft: "22px",
                paddingRight: "22px",
                paddingBottom: "10px",
              }}
            >
              We supplement your data with weather, social media trends,
              holidays, economic metrics, and 100s of other datasets, capturing
              the real-world events that drive your demand.
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

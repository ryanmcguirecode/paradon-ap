import { forwardRef, useState, useEffect } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input, InputProps } from "@mui/joy";

export const currencyToNumber: (currency: any) => number = (currency) => {
  if (!currency) {
    return currency;
  } else if (typeof currency === "number") {
    return currency;
  }
  return currency.amount;
};

interface CurrencyFormatProps {
  onChange: (event: { target: { name: string; value: number } }) => void;
  name: string;
  value?: number;
}

const CurrencyFormatAdapter = forwardRef<
  NumericFormatProps,
  CurrencyFormatProps
>(function CurrencyFormatAdapter(props, ref) {
  const { onChange, value, ...other } = props;
  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: Number(values.value),
          },
        });
      }}
      thousandSeparator
      valueIsNumericString
      prefix="$"
      value={value}
    />
  );
});

export default function CurrencyInput(props: InputProps) {
  return (
    <Input
      {...props}
      slotProps={{
        input: {
          component: CurrencyFormatAdapter,
          value: props.value,
          onChange: props.onChange,
        },
      }}
    />
  );
}

import { forwardRef, useState, useEffect } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input, InputProps } from "@mui/joy";

interface CurrencyFormatProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
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
            value: values.value,
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
  const [value, setValue] = useState(props.defaultValue || 0);

  useEffect(() => {
    setValue(props.defaultValue || 0);
  }, [props.defaultValue]);

  return (
    <Input
      {...props}
      slotProps={{
        input: {
          component: CurrencyFormatAdapter,
          value: value,
          onChange: (event) => {
            setValue(event.target.value);
            if (props.onChange) {
              props.onChange(event);
            }
          },
        },
      }}
    />
  );
}

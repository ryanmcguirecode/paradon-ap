import { Timestamp } from "firebase/firestore";
import { Input, InputProps } from "@mui/joy";

export const dateToIsoString: (date: any) => string = (date) => {
  if (!date || !(date._seconds || date._nanoseconds)) {
    return "";
  }

  return new Timestamp(date._seconds, date._nanoseconds)
    .toDate()
    .toISOString()
    .slice(0, 10);
};

export default function DateInput(props: InputProps) {
  return <Input {...props} type="date" />;
}

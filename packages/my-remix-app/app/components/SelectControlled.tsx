import { type FieldMetadata, useInputControl } from "@conform-to/react";
import { Select, SelectItem } from "@radix-ui/react-select";
import type { FC } from "react";
import { SelectContent, SelectTrigger, SelectValue } from "./ui/select";

type Props = {
  id?: string;
  // You can use the `FieldMetadata` type to define the `meta` prop
  // And restrict the type of the field it accepts through its generics
  meta: FieldMetadata<string | number | null | undefined>;
  options: Array<{
    label: string;
    value: string | number;
  }>;
};

export const SelectControlled: FC<Props> = ({ meta, options }) => {
  const control = useInputControl(meta);

  return (
    <Select
      name={meta.name}
      value={control.value}
      onValueChange={(value) => {
        control.change(value);
      }}
      onOpenChange={(open) => {
        if (!open) {
          control.blur();
        }
      }}
    >
      <SelectTrigger id={meta.id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

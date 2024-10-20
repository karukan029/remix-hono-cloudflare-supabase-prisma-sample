import {
  type FieldMetadata,
  getSelectProps as getConformSelectProps,
} from "@conform-to/react";

export const getCustomSelectProps = <Schema>(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  metadata: FieldMetadata<Schema, any, any>,
  options?: Parameters<typeof getConformSelectProps>[1],
) => {
  const { defaultValue: conformDefaultValue, ...args } =
    getConformSelectProps<Schema>(metadata, options);
  const defaultValue = conformDefaultValue?.toString();

  return {
    defaultValue,
    ...args,
  };
};

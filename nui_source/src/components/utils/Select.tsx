import React, { CSSProperties, FC } from "react";
import { Select as _Select } from "@mantine/core";
import "../../styling/select.css";

export interface SelectOption {
    name: string;
    value?: string;
    label?: string;
    key?: string;
}

interface SelectProps {
    label?: string;
    placeholder?: string;
    description?: string;
    value?: string;
    searchValue?: string;
    onChange?: (value: string) => void;
    onSearchChange?: (value: string) => void;
    error?: string | boolean;
    asterisk?: boolean;
    disabled?: boolean;
    content?: SelectOption[];
    icon?: React.ReactNode;
    searchable?: boolean;
    maxDropdownHeight?: number;
    style?: CSSProperties;
    itemComponent?:
        | FC<{ item: SelectOption }>
        | React.ForwardRefExoticComponent<
              React.PropsWithoutRef<SelectOption> &
                  React.RefAttributes<HTMLDivElement>
          >;
    rightSection?: React.ReactNode;
}

const Select: FC<SelectProps> = ({
    label,
    placeholder,
    description,
    value,
    searchValue,
    onChange,
    onSearchChange,
    error,
    asterisk,
    disabled,
    content,
    icon,
    searchable,
    maxDropdownHeight,
    style,
    itemComponent,
    rightSection,
}) => {
    const options = (content || []).map((item, idx) => {
        // Compute a value ensuring it is a string. If none of the properties exist, we fallback to a default string
        const computedValue = item.value || item.name || `option-${idx}`;
        return {
            ...item,
            key: `${item.name || item.value}-${idx}`,
            value: computedValue,
        };
    });

    return (
        <_Select
            label={label}
            placeholder={placeholder}
            description={description}
            value={value}
            searchValue={searchValue}
            onChange={onChange}
            onSearchChange={onSearchChange}
            data={options}
            disabled={disabled}
            error={error}
            withAsterisk={asterisk}
            icon={icon}
            searchable={searchable}
            maxDropdownHeight={maxDropdownHeight || 300}
            transitionProps={{
                transition: "pop-top-left",
                duration: 200,
                exitDuration: 200,
                timingFunction: "ease",
            }}
            style={style}
            itemComponent={itemComponent}
            rightSection={rightSection}
        />
    );
};

export default Select;

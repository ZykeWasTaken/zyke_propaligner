import React, { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import TextInput from "./TextInput";

interface LocalProps {
    value: string;
    onChange: React.Dispatch<React.SetStateAction<string>>;
    delay?: number;
    style?: React.CSSProperties;
    icon?: React.ReactNode;
    label?: string;
    placeholder?: string;
    error?: string | boolean;
    disabled?: boolean;
}

const DebouncedTextInput: React.FC<LocalProps> = ({
    value,
    onChange,
    delay,
    style,
    icon,
    label,
    placeholder,
    error,
    disabled,
}) => {
    const [innerInput, setInnerInput] = useState<string>(value);
    const [searchStr] = useDebouncedValue(innerInput, delay || 300);

    useEffect(() => {
        if (value === innerInput) return;

        setInnerInput(value);
    }, [value]);

    useEffect(() => {
        onChange(searchStr);
    }, [searchStr]);

    return (
        <TextInput
            label={label || ""}
            placeholder={placeholder}
            icon={icon}
            value={innerInput}
            onChange={(e) => setInnerInput(e.target.value)}
            style={style}
            error={error}
            disabled={disabled}
        />
    );
};

export default DebouncedTextInput;

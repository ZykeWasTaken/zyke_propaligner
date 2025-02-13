import { TextInput as _TextInput } from "@mantine/core";
import React, { useRef } from "react";

interface TextInput {
    label: string;
    placeholder?: string;
    description?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    asterisk?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    width?: string;
    style?: React.CSSProperties;
    id?: string;
}

const TextInput: React.FC<TextInput> = ({
    label,
    placeholder,
    description,
    value,
    onChange,
    error,
    asterisk,
    disabled,
    icon,
    width,
    style,
    id,
}) => {
    const styling = {
        width: width,
        ...style,
    };

    const elementRef = useRef(null);

    return (
        <>
            <_TextInput
                id={id}
                value={value}
                onChange={onChange}
                label={label}
                placeholder={placeholder}
                description={description}
                error={error}
                withAsterisk={asterisk}
                disabled={disabled}
                icon={icon}
                style={styling}
                ref={elementRef}
            />
        </>
    );
};

export default TextInput;

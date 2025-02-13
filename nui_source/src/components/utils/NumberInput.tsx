import { NumberInput as _NumberInput, TextInput } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

interface TextInput {
    label: string;
    placeholder?: string;
    description?: string;
    value: number;
    onChange: (event: number) => void;
    error?: string;
    asterisk?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    width?: string;
    style?: React.CSSProperties;
    id?: string;
    rightSection?: React.ReactNode;
    hideControls?: boolean;
    precision?: number;
}

const NumberInput: React.FC<TextInput> = ({
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
    rightSection,
    hideControls,
    precision,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const styling = {
        width: width,
        ...style,
    };

    const elementRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!elementRef || !elementRef.current) return;

        const ensureFocus = () =>
            setIsFocused(document.activeElement == elementRef.current);

        elementRef.current.addEventListener("focus", ensureFocus);
        elementRef.current.addEventListener("blur", ensureFocus);

        return () => {
            if (elementRef.current) {
                elementRef.current.removeEventListener("focus", ensureFocus);
                elementRef.current.removeEventListener("blur", ensureFocus);
            }
        };
    }, []);

    return (
        <>
            <_NumberInput
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
                rightSection={rightSection}
                ref={elementRef || undefined}
                className={isFocused ? "focused" : undefined}
                precision={precision}
                hideControls={hideControls}
            />
        </>
    );
};

export default NumberInput;

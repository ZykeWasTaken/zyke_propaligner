import { Tooltip as MantineTooltip } from "@mantine/core";

interface TooltipProps {
    disabled?: boolean;
    label?: string | undefined;
    children: React.ReactNode;
    withArrow?: boolean;
    position?:
        | "bottom"
        | "left"
        | "right"
        | "top"
        | "bottom-end"
        | "bottom-start"
        | "left-end"
        | "left-start"
        | "right-end"
        | "right-start"
        | "top-end"
        | "top-start";
}

const Tooltip: React.FC<TooltipProps> = ({
    disabled,
    label,
    children,
    withArrow,
    position,
}) => {
    return (
        <>
            {label ? (
                !disabled ? (
                    <MantineTooltip
                        label={label}
                        withArrow={withArrow}
                        arrowSize={11}
                        position={position}
                        multiline
                        style={{
                            width: "fit-content",
                            maxWidth: "220px",
                            textAlign: "center",
                        }}
                    >
                        <div>{children}</div>
                    </MantineTooltip>
                ) : (
                    <>{children}</>
                )
            ) : (
                <>{children}</>
            )}
        </>
    );
};

export default Tooltip;

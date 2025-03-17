import { Box, Button as MUIButton, SxProps, Theme } from "@mui/material";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import CheckIcon from "@mui/icons-material/Check";
import _color from "./Color";
import { Loader } from "@mantine/core";
import GetVarValue from "./GetVarValue";
import chroma, { Color } from "chroma-js";
import React, { useEffect, useState } from "react";

interface Buttonprops {
    icon?: React.ReactNode;
    rightIcon?: "dialog" | "newPage" | "confirm";
    useRightIconAnimation?: boolean;

    hollow?: boolean;
    removeDefaultComponent?: boolean;
    color?: string;
    buttonStyling?: SxProps<Theme>;
    boxStyling?: SxProps<Theme>;
    textStyling?: React.CSSProperties;
    iconStyling?: React.CSSProperties;
    textContainerStyling?: SxProps<Theme>;
    wide?: boolean;

    disabled?: boolean;
    loading?: boolean;
    loadDelay?: number;
    shouldLoad?: () => boolean;

    onClick?: (e?: React.MouseEventHandler<HTMLButtonElement>) => void;

    children: React.ReactNode;
}

const Button: React.FC<Buttonprops> = ({
    icon,
    rightIcon,
    useRightIconAnimation,

    hollow,
    removeDefaultComponent,
    color,
    buttonStyling,
    boxStyling,
    iconStyling,
    textStyling,
    textContainerStyling,
    wide, // Width 100%, centering content

    disabled,
    loading,
    loadDelay, // Artifical delay when loading and pressing buttons
    shouldLoad,

    onClick,

    children,
}) => {
    const [_loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof loading !== "boolean") return;

        setLoading(loading);
    }, [loading]);

    const defaultBackground = "var(--grey)";
    const defaultText = "var(--text)";

    const colorToUse = color
        ? GetVarValue(color)
        : GetVarValue(defaultBackground);

    const _backgroundColor: Color = chroma(colorToUse);

    const text = GetVarValue(defaultText);
    const _textColor = hollow ? _backgroundColor : chroma(text); // When hollow, set color same as background

    const rightIcons = {
        ["dialog"]: <ContentPasteGoIcon className="rightIcon" />,
        ["newPage"]: <KeyboardDoubleArrowRightIcon className="rightIcon" />,
        ["confirm"]: <CheckIcon className="rightIcon" />,
    };

    const isDisabled = disabled || _loading || false;

    //
    // Background Color
    //

    let backgroundColor: Color;
    backgroundColor = hollow ? _backgroundColor.alpha(0.2) : _backgroundColor;

    // When disabled, remove contrast / dim it by opacity
    if (isDisabled) {
        backgroundColor = hollow
            ? backgroundColor.darken(0.5).desaturate(1.5).alpha(0.1)
            : backgroundColor.alpha(0.5);
    }

    //
    // Border color
    //

    let borderColor: Color | "transparent";
    if (hollow) {
        borderColor = "transparent";
    } else {
        borderColor = backgroundColor.brighten(0.2);

        if (isDisabled) {
            borderColor = backgroundColor.alpha(0);
        }
    }

    //
    // Text color
    //

    let textColor; // Text, icons & loaders
    textColor = _textColor;
    if (isDisabled) {
        textColor = hollow
            ? textColor.darken(0.5).desaturate(1.5)
            : textColor.alpha(0.5);
    }

    const backgroundHex = backgroundColor.hex();
    const textHex = textColor.hex();
    const borderHex =
        (borderColor === "transparent" ? "transparent" : borderColor.hex()) +
        " !important";

    const getHoverValue = (color: Color): string => {
        return color.brighten(0.5).hex();
    };

    const _onClick = () => {
        let _shouldLoad = true;
        if (shouldLoad) _shouldLoad = shouldLoad();

        if (loadDelay && _shouldLoad) {
            setLoading(true);

            setTimeout(async () => {
                if (onClick) {
                    await onClick();
                }

                setLoading(false);
            }, loadDelay);
        } else {
            if (onClick) onClick();
        }
    };

    return (
        <MUIButton
            variant="contained"
            onClick={_onClick}
            disabled={isDisabled}
            sx={{
                // Centering
                display: "flex",
                justifyContent: "start",
                alignItems: "center",

                // Text Stuff
                textTransform: "none",

                // Width & Sizing Stuff
                padding: "0.35rem 0.45rem 0.35rem 0.6rem !important",
                minPadding: "0 0 0 0 !important",
                boxSizing: "border-box",

                margin: "0.5rem 0 0 0",
                minHeight: "0 !important",
                minWidth: "0 !important",
                width: wide ? "100%" : "fit-content",
                height: "fit-content",
                borderRadius: "var(--mborderRadius)",

                // Colors
                background: `${backgroundHex} !important`,
                border: `1px solid ${borderHex} !important`,

                // Hover Main Button Div Styling
                ["&:hover"]: {
                    background: !isDisabled
                        ? getHoverValue(backgroundColor) + " !important"
                        : undefined,

                    // When Hovering Main, Right Icon Styling
                    ["& .rightIcon"]: {
                        transform: useRightIconAnimation
                            ? "translateX(35%)"
                            : undefined,
                    },
                },

                // Right Icon Styling
                ["& .rightIcon"]: {
                    transform: !useRightIconAnimation
                        ? "translateX(35%)"
                        : undefined,
                    marginRight: "1rem",
                },

                ...buttonStyling,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",

                    // Icon Styling
                    "& svg": {
                        marginRight: "0.5rem",
                        fontSize: "1.5rem",
                        color: `${textHex}`,
                        fill: `${textHex}`,
                        transition: "all 0.2s ease-in-out",
                        ...iconStyling,
                    },

                    // Text Styling
                    "& p": {
                        color: `${textHex}`,
                        fontSize: "1.4rem",
                        margin: "0rem 0.2rem 0 0",
                        fontWeight: hollow ? "400" : "400",
                        transition: "all 0.2s ease-in-out",
                        ...textStyling,
                    },

                    ...boxStyling,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: wide ? "center" : "start",
                        width: "100%",

                        ...textContainerStyling,
                    }}
                >
                    {icon && (
                        <LeftIcon
                            icon={icon}
                            color={textHex}
                            loading={_loading}
                        />
                    )}
                    {removeDefaultComponent ? children : <p>{children}</p>}
                </Box>
                {rightIcon && rightIcons[rightIcon]}
            </Box>
        </MUIButton>
    );
};

export default Button;

interface LeftIconProps {
    color: string;
    icon: React.ReactNode;
    loading?: boolean;
}

const LeftIcon: React.FC<LeftIconProps> = ({ color, icon, loading }) => {
    return loading ? (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                ["& .loader"]: {
                    marginRight: "0.5rem",
                    stroke: `${color}`,
                    fontSize: "1.5rem",
                    width: "1.5rem !important",
                    height: "1.5rem !important",
                },
            }}
        >
            <Loader className="loader" />
        </Box>
    ) : icon ? (
        <>{icon}</>
    ) : null;
};

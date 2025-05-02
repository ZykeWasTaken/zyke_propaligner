import { Box } from "@mantine/core";
import React from "react";

interface CornerStylingProps {
    color: string;
    size?: string; // Default size is 0.5rem
    borderSize?: string; // Default border size is 0.2rem
    hovered?: boolean;
}

const CornerStyling: React.FC<CornerStylingProps> = ({
    color,
    size = "0.5rem",
    borderSize = "0.2rem",
    hovered = true,
}) => {
    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                opacity: hovered ? 1 : 0.0,
                transition: "opacity 0.2s",
                pointerEvents: "none",
                top: 0,
                left: 0,
                willChange: "opacity",
            }}
        >
            <Box
                sx={{
                    width: size,
                    height: size,
                    borderLeft: `${borderSize} solid ${color}`,
                    borderTop: `${borderSize} solid ${color}`,
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}
            ></Box>
            <Box
                sx={{
                    width: size,
                    height: size,
                    borderRight: `${borderSize} solid ${color}`,
                    borderTop: `${borderSize} solid ${color}`,
                    position: "absolute",
                    top: 0,
                    right: 0,
                }}
            ></Box>
            <Box
                sx={{
                    width: size,
                    height: size,
                    borderRight: `${borderSize} solid ${color}`,
                    borderBottom: `${borderSize} solid ${color}`,
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                }}
            ></Box>
            <Box
                sx={{
                    width: size,
                    height: size,
                    borderLeft: `${borderSize} solid ${color}`,
                    borderBottom: `${borderSize} solid ${color}`,
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                }}
            ></Box>
        </Box>
    );
};

export default CornerStyling;

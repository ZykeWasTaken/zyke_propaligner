import React from "react";

interface DottedBackgroundProps {
    hovered?: boolean;
    color?: string;
}

const DottedBackground: React.FC<DottedBackgroundProps> = ({
    hovered,
    color = "rgb(80, 80, 80)",
}) => {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                left: "0",
                top: "0",
                backgroundImage: `radial-gradient(${color} 20%, transparent 9%)`,
                backgroundSize: "10px 10px",
                zIndex: 2,
                opacity: hovered ? 1.0 : 0.3,
                transition: "opacity 0.2s",
            }}
        />
    );
};

export default DottedBackground;

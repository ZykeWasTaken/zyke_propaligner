import React from "react";
import Button, { ButtonProps } from "./Button";

interface IconButtonProps extends ButtonProps {
    plain?: boolean;
}

const IconButton: React.FC<IconButtonProps> = (props) => {
    return (
        <Button
            {...props}
            buttonStyling={{
                height: "3rem",
                margin: "0rem",
                width: "3rem",

                ...(props.plain && {
                    background: "none !important",
                    boxShadow: "none",
                    border: "none",
                }),

                ...props.buttonStyling,
            }}
            textContainerStyling={{
                justifyContent: "center",

                ["& svg"]: {
                    margin: "0 !important",
                },

                ...props.textContainerStyling,
            }}
            removeDefaultComponent
        >
            {props.children}
        </Button>
    );
};

export default IconButton;

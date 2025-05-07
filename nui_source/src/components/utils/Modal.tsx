import { Box, LoadingOverlay, OptionalPortal } from "@mantine/core";
import CloseIcon from "@mui/icons-material/Close";
import {
    AnimatePresence,
    AnimationControls,
    motion,
    TargetAndTransition,
    VariantLabels,
} from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ButtonBase, CircularProgress } from "@mui/material";
import { useModalContext } from "../../context/ModalContext";

interface ModalProps {
    id: string;
    onClose?: () => void;
    onClickOutside?: () => void;
    disableClosing?: boolean;
    disablePortal?: boolean;
    disableClickOutside?: boolean;
    disableBackdrop?: boolean;
    title?: string;
    icon?: ReactNode;
    description?: string;
    children?: ReactNode;
    closeButton?: boolean | (() => void);
    extraHeaderContent?: ReactNode;
    width?: string;
    loading?: boolean;
    loadingContent?: boolean;
    disableStyling?: boolean;
    disableHeader?: boolean;
    plain?: boolean;
    childrenContainerStyling?: React.CSSProperties;
    modalStyling?: React.CSSProperties;
    headerStyling?: React.CSSProperties;
    modalAnimation?: {
        initial?: VariantLabels;
        animate?: AnimationControls;
        exit?: TargetAndTransition;
    };
    onExited?: () => void;
}

const Modal: React.FC<ModalProps> = ({
    id,

    onClose,
    onClickOutside,
    disableClosing, // Disable all actions closing, if you want to manually close the modal, onClose will run
    disablePortal,
    disableClickOutside,
    disableBackdrop, // Does not disable clicking outside, just the styling of the backdrop

    title,
    icon,
    description,
    children,
    closeButton,
    extraHeaderContent,

    width,
    loading,
    loadingContent,
    disableStyling,
    disableHeader,
    plain,
    childrenContainerStyling,
    modalStyling,
    headerStyling,
    modalAnimation,
    onExited,
}) => {
    const { modalsOpen } = useModalContext();
    const [open, setOpen] = useState(false);
    const [suspended, setSuspended] = useState<boolean>(false);
    const idx = useRef(0);
    const wasSuspended = useRef(false);

    useEffect(() => {
        if (modalsOpen[id] && !open) {
            setOpen(true);
            idx.current = modalsOpen[id].idx + 1000;
        } else if (!modalsOpen[id] && open) {
            setOpen(false);
            if (onClose) onClose();
        }

        if (modalsOpen[id]) {
            if (modalsOpen[id].suspended && !suspended) {
                setSuspended(true);
                wasSuspended.current = true;
            } else if (!modalsOpen[id].suspended && suspended) {
                setSuspended(false);
            }
        }
    }, [modalsOpen[id]]);

    if (plain) {
        disableHeader = true;
        closeButton = false;
    }

    const animDelay =
        wasSuspended.current === true
            ? 0.0
            : loading !== undefined && modalsOpen[id] !== undefined
            ? 0.2
            : 0;

    // Previous used before suspended
    // const animDelay =
    //     loading !== undefined && modalsOpen[id] !== undefined ? 0.2 : 0;

    // In order to properly act on the value, we change it here
    // We do set it to true instantly when we set the suspended useEffect to keep it accurate
    // Naming might be a little weird, but works for what it is meant to do
    useEffect(() => {
        wasSuspended.current = suspended;
    }, [suspended]);

    return (
        <OptionalPortal
            withinPortal={!disablePortal}
            className="modal"
            id={`modal-${id}`}
            style={{
                opacity: modalStyling?.opacity,
                transition: modalStyling?.transition,
            }}
        >
            <BackDrop
                id={id}
                open={open && !suspended}
                disableBackdrop={disableBackdrop}
                disableClickOutside={disableClickOutside}
                disableClosing={disableClosing}
                onClose={onClose}
                onClickOutside={onClickOutside}
                idx={idx.current - 1}
            />
            <Loading open={open} loading={loading ? true : false} />
            <AnimatePresence onExitComplete={onExited}>
                {open && !loading && (
                    <motion.div
                        className="modal-content"
                        initial={
                            modalAnimation?.initial || {
                                opacity: 0,
                                scale: 0.98,
                            }
                        }
                        animate={
                            modalAnimation?.animate || {
                                opacity: suspended ? 0.0 : 1.0,
                                scale: 1.0,
                            }
                        }
                        exit={
                            modalAnimation?.exit || {
                                opacity: 0,
                                scale: 0.98,
                            }
                        }
                        transition={{
                            duration: 0.2,
                            delay: animDelay,
                        }}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            translateX: "-50%",
                            translateY: "-50%",
                            background: "rgba(var(--dark))",
                            minWidth: !disablePortal ? "40rem" : undefined,
                            maxWidth: !disablePortal ? "80%" : undefined,
                            width: width,
                            zIndex: idx.current,
                            pointerEvents: suspended ? "none" : "auto",

                            borderRadius: !disableStyling
                                ? "var(--lborderRadius)"
                                : undefined,
                            boxShadow: !disableStyling
                                ? "0 0 5px 0 rgba(0, 0, 0, 0.5)"
                                : undefined,
                            boxSizing: "border-box",
                            border: !disableStyling
                                ? !disableHeader
                                    ? "1px solid rgba(var(--grey3))"
                                    : "1px solid rgba(var(--dark3))"
                                : "none",

                            ...modalStyling,
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                position: "relative",
                            }}
                        >
                            <Header
                                id={id}
                                disableStyling={disableStyling}
                                disableHeader={disableHeader}
                                headerStyling={headerStyling}
                                icon={icon}
                                title={title}
                                extraHeaderContent={extraHeaderContent}
                                closeButton={closeButton}
                                disableClosing={disableClosing}
                                onClose={onClose}
                                plain={plain}
                            />
                            {description && (
                                <Description description={description} />
                            )}
                            <ChildContainer
                                disableStyling={disableStyling}
                                disableHeader={disableHeader}
                                childrenContainerStyling={
                                    childrenContainerStyling
                                }
                                children={children}
                                loadingContent={loadingContent}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </OptionalPortal>
    );
};

export default Modal;

interface HeaderProps {
    id?: string;
    disableStyling?: boolean;
    disableHeader?: boolean;
    headerStyling?: React.CSSProperties;
    icon?: React.ReactNode;
    title?: string;
    extraHeaderContent?: React.ReactNode;
    closeButton?: boolean | (() => void);
    disableClosing?: boolean;
    onClose?: () => void;
    plain?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    id,
    disableStyling,
    disableHeader,
    headerStyling,
    icon,
    title,
    extraHeaderContent,
    closeButton,
    disableClosing,
    onClose,
    plain,
}) => {
    const { closeModal } = useModalContext();

    return (
        <div
            className="header-container"
            style={{
                width: "100%",
                boxSizing: "border-box",
                position: "relative",
                padding: !disableStyling
                    ? !disableHeader
                        ? "0.25rem 0.75rem"
                        : "0.5rem 1rem 0rem 1rem"
                    : "0",
                height: plain ? "0" : !disableStyling ? "3.5rem" : undefined,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",

                background: !disableHeader ? "rgba(var(--grey))" : undefined,
                boxShadow: !disableHeader
                    ? "0 2px 3px 0 rgba(0, 0, 0, 0.2)"
                    : undefined,
                borderBottom: !disableHeader
                    ? "1px solid rgba(var(--grey3))"
                    : undefined,

                ...headerStyling,
            }}
        >
            <Box
                className="title-container"
                sx={{
                    width: "100%",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",

                    "& svg": {
                        marginRight: "0.5rem",
                        fill: "rgba(var(--icon))",
                        fontSize: !disableHeader ? "1.9rem" : "1.6rem",
                    },
                }}
            >
                {icon && icon}
                {title && (
                    <h1
                        className="truncate"
                        style={{
                            margin: "0.2rem 0 0 0",
                            fontSize: !disableHeader ? "2rem" : "1.7rem",
                        }}
                    >
                        {title}
                    </h1>
                )}
            </Box>

            {extraHeaderContent && extraHeaderContent}
            {closeButton && (
                <div
                    className="close-button-container"
                    style={{
                        width: "3rem",
                        height: "100%",
                        display: "flex",
                        justifyContent: "end",
                        alignItems: "center",
                    }}
                >
                    <ButtonBase
                        sx={{
                            borderRadius: "50%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "0.2rem",

                                cursor: "pointer",
                                transition: "background 0.2s",
                            }}
                            onClick={() => {
                                if (disableClosing) {
                                    if (onClose) onClose();

                                    return;
                                }

                                if (typeof closeButton === "function")
                                    return closeButton();

                                closeModal(id);
                            }}
                        >
                            <CloseIcon
                                sx={{
                                    color: "rgba(var(--icon))",
                                    width: "1.65rem",
                                    height: "1.65rem",
                                }}
                            />
                        </div>
                    </ButtonBase>
                </div>
            )}
        </div>
    );
};

const Description = ({ description }: { description: string }) => {
    return (
        <>
            {description ? (
                <div
                    className="description-container"
                    style={{
                        padding: "0 1rem 0.5rem 1rem",
                        marginRight: "3rem",
                    }}
                >
                    <p
                        style={{
                            color: "rgba(var(--secText))",
                            fontSize: "1.2rem",
                        }}
                    >
                        {description}
                    </p>
                </div>
            ) : null}
        </>
    );
};

interface BackDropProps {
    open: boolean;
    disableBackdrop?: boolean;
    disableClickOutside?: boolean;
    disableClosing?: boolean;
    onClose?: () => void;
    onClickOutside?: () => void;
    id?: string;
    idx: number;
}

const BackDrop: React.FC<BackDropProps> = ({
    open,
    disableBackdrop,
    disableClickOutside,
    disableClosing,
    onClose,
    onClickOutside,
    id,
    idx,
}) => {
    const { closeModal } = useModalContext();

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        background: `rgba(0, 0, 0, ${
                            disableBackdrop ? "0" : "0.5"
                        })`,
                        top: 0,
                        left: 0,
                        zIndex: idx,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                        if (disableClickOutside) return;

                        if (disableClosing) {
                            if (onClose) onClose();

                            return;
                        }

                        if (onClickOutside) onClickOutside();

                        closeModal(id);
                    }}
                ></motion.div>
            )}
        </AnimatePresence>
    );
};

const Loading = ({ open, loading }: { open: boolean; loading: boolean }) => {
    return (
        <AnimatePresence>
            {open && loading && (
                <motion.div
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        translateX: "-50%",
                        translateY: "-50%",
                        zIndex: 1000,
                    }}
                >
                    <CircularProgress />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

interface ChildContainerProps {
    disableStyling?: boolean;
    disableHeader?: boolean;
    childrenContainerStyling?: React.CSSProperties;
    children: ReactNode;
    loadingContent?: boolean;
}

const ChildContainer: React.FC<ChildContainerProps> = ({
    disableStyling,
    disableHeader,
    childrenContainerStyling,
    children,
    loadingContent,
}) => {
    return (
        <div
            className="children-container"
            style={{
                position: "relative",
                padding: !disableStyling
                    ? !disableHeader
                        ? "1rem"
                        : "0rem 1rem 1rem 1rem"
                    : "0",
                ...childrenContainerStyling,
            }}
        >
            <LoadingOverlay
                visible={loadingContent ? true : false}
            ></LoadingOverlay>
            {children}
        </div>
    );
};

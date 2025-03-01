import { ButtonBase } from "@mui/material";
import { Fragment, useEffect, useState, useRef, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickOutside } from "@mantine/hooks";
import { Box, Radio } from "@mantine/core";

const itemHeight = "2.3rem";
const dividerHeight = "0.1rem";
const dividerMarginTop = "0.4rem";
const dividerMarginBottom = "0.4rem";

// The data for the item that is passed in
export interface DropDownItemData {
    label: string;
    name: string;
    icon?: ReactNode | ((data: { style: React.CSSProperties }) => ReactNode);
    radioButton?: boolean;
    onClick?: () => void;
}

interface DropDownTitleData {
    label: string;
    isTitle: true;
    icon?: ReactNode | ((data: { style: React.CSSProperties }) => ReactNode);
}

type DropDownItemType = DropDownItemData | DropDownTitleData;

// The item data & props to construct it in the dropdown menu
interface DropDownItem {
    isTitle?: boolean;
    setHoverIdx: (num: number | null) => void;
    idx: number;
    label: string;
    icon?: ReactNode | ((data: { style: React.CSSProperties }) => ReactNode);
    onClick?: (args: any) => void;
    closeOnClick?: boolean;
    closeDropDown: () => void;
    disabled?: boolean;
    itemComponent?: (item: any) => ReactNode;
    selected?: boolean;
    radioButton?: boolean;
    menuId: string;
    item: DropDownItemType;
    globalOnClick?: (name: string) => void;
}

interface DropDownProps {
    open: boolean;
    setOpen: (state: boolean) => void;
    title?: string;
    icon?: ReactNode | ((data: { style: React.CSSProperties }) => ReactNode);
    items: DropDownItemType[];
    styling: React.CSSProperties;
    children: ReactNode;
    onClick?: () => void;
    closeOnClick?: boolean;
    position?:
        | "left-up"
        | "left"
        | "bottom"
        | "bottom-right"
        | "right"
        | "right-up";
    itemComponent?: (item: any) => ReactNode;
}

const DropDown: React.FC<DropDownProps> = ({
    open,
    setOpen,
    title,
    icon,
    items,
    styling,
    children,
    onClick: globalOnClick,
    closeOnClick,
    position,
    itemComponent,
}) => {
    const generateMenuId = () =>
        "dropdown-" + Math.random().toString(36).substr(2, 9);

    const [menuId, setMenuId] = useState<string>(() => generateMenuId());

    const ref = useClickOutside(() => {
        if (open) setOpen(false);
    });

    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const [shouldAnimateHoverBox, setShouldAnimateHoverBox] =
        useState<boolean>(false);

    const childRef = useRef<HTMLDivElement>(null);
    const [childDimensions, setChildDimensions] = useState({
        height: 0,
        width: 0,
    });

    // Disable the positioning animation for the hover box if you are not hovering over an item
    // This is to prevent weird behavior making the hover box jump around when you hover different parts when hovering outside in between
    useEffect(() => {
        setTimeout(() => {
            setShouldAnimateHoverBox(hoverIdx !== null);
        }, 1);
    }, [hoverIdx]);

    useEffect(() => {
        if (childRef.current) {
            const dimensions = childRef.current.getBoundingClientRect();

            setChildDimensions({
                height: dimensions.height / 10,
                width: dimensions.width / 10,
            });
        }
    }, [children]);

    const closeDropDown = () => setOpen(false);

    useEffect(() => {
        setHoverIdx(null);
    }, [open]);

    const [menuDimensions, setMenuDimensions] = useState({
        height: 0,
        width: 0,
    });

    let middle = menuDimensions.width / 2 - childDimensions.width / 2;
    if (middle > 0) {
        middle = -middle;
    } else {
        middle = 0 + -middle / 2;
    }

    useEffect(() => {
        if (!open) return;

        const parent = document.getElementById(menuId);
        if (parent) {
            setMenuDimensions({
                height: parent.offsetHeight / 10,
                width: parent.offsetWidth / 10,
            });
        }
    }, [open]);

    const posStyling = {
        ["left-up"]: {
            translateX: "calc(-100% - 0.5rem)",
            translateY: `calc(-${menuDimensions.height}rem + ${childDimensions.height}rem)`,
        },
        ["left"]: {
            translateX: "calc(-100% - 0.5rem)",
        },
        ["bottom"]: {
            translateY: "3rem",
            translateX: `${middle}rem`,
        },
        ["bottom-right"]: {
            translateY: "3.5rem",
        },
        ["right"]: {
            translateX: `calc(${childDimensions.width}rem + 0.5rem)`,
        },
        ["right-up"]: {
            translateX: `calc(${childDimensions.width}rem + 0.5rem)`,
            translateY: `calc(-${menuDimensions.height}rem + ${childDimensions.height}rem)`,
        },
    };

    position = position || "left";

    // Add the title at the top
    if (title) {
        items = [{ label: title, icon: icon, isTitle: true }, ...items];
    }

    return (
        <div
            ref={ref}
            style={{
                position: "relative",
            }}
        >
            <AnimatePresence>
                {open && (
                    <motion.div
                        id={menuId}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            position: "fixed", // Sometimes needs to be set as absolute through styling
                            background: "rgba(var(--dark), 1.0)",
                            borderRadius: "var(--lborderRadius)",
                            boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
                            border: "1px solid rgb(var(--grey3))",
                            zIndex: 1000,
                            cursor: "default",

                            ...posStyling[position],
                            ...styling,
                        }}
                    >
                        <div
                            className="item-list"
                            style={{
                                position: "relative",
                                padding: "0.4rem",
                                boxSizing: "border-box",
                                overflow: "hidden",
                            }}
                        >
                            <HoverBox
                                menuId={menuId}
                                hoverIdx={hoverIdx}
                                shouldAnimateHoverBox={shouldAnimateHoverBox}
                            />

                            <ItemList
                                menuId={menuId}
                                items={items}
                                setHoverIdx={setHoverIdx}
                                shouldAnimateHoverBox={shouldAnimateHoverBox}
                                globalOnClick={globalOnClick}
                                closeOnClick={closeOnClick}
                                closeDropDown={closeDropDown}
                                itemComponent={itemComponent}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div ref={childRef}>{children}</div>
        </div>
    );
};

export default DropDown;

const Item: React.FC<DropDownItem> = ({
    isTitle,
    setHoverIdx,
    idx,
    label,
    icon,
    onClick,
    closeOnClick,
    closeDropDown,
    disabled,
    itemComponent,
    selected, // If the item is marked as selected, to display an extra hoverbox for it, in blue
    radioButton,
    menuId,
    item, // Pass the whole item object to the item component
    globalOnClick,
}) => {
    return (
        <>
            {selected && (
                <HoverBox
                    menuId={menuId}
                    hoverIdx={idx}
                    shouldAnimateHoverBox={false}
                    selected={true}
                />
            )}

            <ButtonBase
                // disableRipple={isTitle}
                disabled={isTitle || disabled}
                onClick={(args: any) => {
                    if (!("name" in item)) return;

                    if (closeOnClick) closeDropDown();
                    if (globalOnClick) globalOnClick(item.name);
                    if (onClick) onClick(args);
                }}
                style={{
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "var(--spadding) var(--mpadding)",
                    width: "100%",
                    height: itemHeight,
                }}
                onMouseEnter={() => {
                    !isTitle && setHoverIdx(idx);
                }}
                onMouseLeave={() => {
                    !isTitle && setHoverIdx(null);
                }}
            >
                {itemComponent ? (
                    itemComponent(item)
                ) : (
                    <>
                        {radioButton !== null && radioButton !== undefined && (
                            <Radio
                                checked={radioButton ? true : false}
                                readOnly
                            />
                        )}

                        {icon && (
                            <ItemIcon
                                isTitle={isTitle}
                                icon={icon}
                                disabled={disabled}
                            />
                        )}
                        <p
                            className="truncate"
                            style={{
                                cursor: "pointer",
                                color:
                                    disabled || isTitle
                                        ? "rgba(var(--secText))"
                                        : "rgba(var(--text))",
                                fontSize: "1.2rem",
                                fontWeight: "400",
                            }}
                        >
                            {label}
                        </p>
                    </>
                )}
            </ButtonBase>
        </>
    );
};

interface ItemListProps {
    items: DropDownItemType[];
    setHoverIdx: (num: number | null) => void;
    shouldAnimateHoverBox: boolean;
    closeOnClick?: boolean;
    closeDropDown: () => void;
    itemComponent?: (item: any) => ReactNode;
    menuId: string;
    globalOnClick?: (name: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({
    items,
    setHoverIdx,
    closeOnClick,
    closeDropDown,
    itemComponent,
    menuId,
    globalOnClick,
}) => {
    return (
        <>
            {items.map((item, idx) => {
                return "name" in item ? (
                    <Fragment key={item.name + "-" + idx}>
                        <Item
                            idx={idx}
                            item={item}
                            menuId={menuId}
                            closeOnClick={closeOnClick}
                            closeDropDown={closeDropDown}
                            setHoverIdx={setHoverIdx}
                            itemComponent={itemComponent}
                            globalOnClick={globalOnClick}
                            {...item}
                        />
                    </Fragment>
                ) : (
                    <Fragment key={"title" + "-" + idx}>
                        <Item
                            idx={idx}
                            item={item}
                            menuId={menuId}
                            closeOnClick={closeOnClick}
                            closeDropDown={closeDropDown}
                            setHoverIdx={setHoverIdx}
                            itemComponent={itemComponent}
                            globalOnClick={globalOnClick}
                            {...item}
                        />

                        <Divider />
                    </Fragment>
                );
            })}
        </>
    );
};

const HoverBox: React.FC<{
    menuId: string;
    hoverIdx: number | null;
    shouldAnimateHoverBox: boolean;
    selected?: boolean;
}> = ({ menuId, hoverIdx, shouldAnimateHoverBox, selected }) => {
    const totalDividers = document.querySelectorAll(
        "#" + menuId + " .divider"
    ).length;

    const itemHeightCalc = `calc(${hoverIdx} * ${itemHeight})`;

    const totalDividerHeightCalc = `calc(${dividerHeight} + ${dividerMarginTop} + ${dividerMarginBottom})`;
    const totalDividersCalc = `calc(${totalDividers} * ${totalDividerHeightCalc})`;

    return (
        <motion.div
            className="hover-box"
            style={{
                width: "100%",
                height: itemHeight,
                position: "absolute",
                top: `calc(${itemHeightCalc} + ${totalDividersCalc})`,
                left: 0,
                zIndex: -1,
                padding: "0 0.4rem",
                marginTop: "0.4rem",
                opacity: hoverIdx !== null ? 1 : 0,
                transition: shouldAnimateHoverBox
                    ? "top 0.1s, opacity 0.2s"
                    : "opacity 0.2s, top 0s",
            }}
        >
            <div
                style={{
                    background: selected
                        ? "rgba(var(--blue2), 1.0)"
                        : "rgba(var(--grey3), 1.0)",
                    width: "calc(100% - 0.8rem)",
                    height: itemHeight,
                    borderRadius: "var(--borderRadius)",
                    scale: hoverIdx !== null ? "1" : "0.9",
                    transition: "scale 0.4s",
                }}
            ></div>
        </motion.div>
    );
};

const Divider = () => {
    return (
        <div
            className="divider"
            style={{
                width: "100%",
                height: dividerHeight,
                background: "rgba(var(--grey3))",
                marginTop: dividerMarginTop,
                marginBottom: dividerMarginBottom,
            }}
        ></div>
    );
};

interface ItemIconProps {
    icon: ReactNode | ((data: { style: React.CSSProperties }) => ReactNode);
    disabled?: boolean;
    isTitle?: boolean;
}

const ItemIcon: React.FC<ItemIconProps> = ({ icon, disabled, isTitle }) => {
    const fill = "rgba(var(--icon))";
    const disabledFill = "rgba(var(--secIcon))";
    const fillToUse = disabled || isTitle ? disabledFill : fill;
    const marginRight = "0.25rem";

    return (
        <>
            {typeof icon === "function" ? (
                icon({
                    style: {
                        height: "1.4rem",
                        width: "1.4rem",
                        fill: fillToUse,
                        marginRight: marginRight,
                    },
                })
            ) : (
                <Box
                    sx={{
                        "& svg": {
                            height: "1.4rem",
                            width: "1.4rem",
                            fill: fillToUse,
                            marginRight: marginRight,
                        },
                    }}
                >
                    {icon}
                </Box>
            )}
        </>
    );
};

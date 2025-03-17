import React, { useEffect, useRef, useState } from "react";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import CropRotateIcon from "@mui/icons-material/CropRotate";
import { useTranslation } from "../context/Translation";
import NumberInput from "./utils/NumberInput";
import { AlignmentData } from "../types";
import TextInput from "./utils/TextInput";
import { FaBox } from "react-icons/fa6";
import { useDebouncedValue } from "@mantine/hooks";
import { callback } from "./utils/nui-events";
import { Accordion } from "@mantine/core";
import { PiBoneFill } from "react-icons/pi";
import TagIcon from "@mui/icons-material/Tag";
import Button from "./utils/Button";
import { LuCrown } from "react-icons/lu";
import DeleteIcon from "@mui/icons-material/Delete";
import Wait from "./utils/Wait";

const PropAlignments = ({
    idx,
    prop,
    bone,
    offset,
    rotation,
    setEditingData,
    totalProps,
    setCurrProp,
}: {
    idx: number;
    prop: string;
    bone: number;
    offset: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    setEditingData: React.Dispatch<React.SetStateAction<AlignmentData>>;
    totalProps: number;
    setCurrProp: (id: string) => void;
}) => {
    const T = useTranslation();
    const [propModelChange] = useDebouncedValue(prop, 500);
    const [modelValid, setModelValid] = useState<boolean>(true);
    const firstRender = useRef(true);

    const setValue = (
        path: "rotation" | "offset",
        key: "x" | "y" | "z",
        val: number | string
    ) => {
        setEditingData((prev) => ({
            ...prev,
            props: prev.props.map((item, i) =>
                i === idx
                    ? {
                          ...item,
                          [path]: {
                              ...item[path],
                              [key]: val,
                          },
                      }
                    : item
            ),
        }));
    };

    useEffect(() => {
        // Avoid instant error, allow modifying first
        if (firstRender.current === true) {
            firstRender.current = false;
            return;
        }

        if (!propModelChange) return setModelValid(false);
        if (propModelChange.length === 0) return setModelValid(false);

        callback("ValidatePropModel", propModelChange).then((res) =>
            setModelValid(res)
        );
    }, [propModelChange]);

    const makePrimary = () => {
        if (idx === 0) return;

        setEditingData((prev) => {
            const nProps = [...prev.props];
            const [movedItem] = nProps.splice(idx, 1);
            nProps.unshift(movedItem);

            return { ...prev, props: nProps };
        });
    };

    const deleteProp = async () => {
        if (totalProps <= 1) return;

        // Due to component keys, we ignore if we have a higher index available
        if (idx === totalProps - 1) {
            setCurrProp("prop-" + (idx - 1));

            await Wait(200);
        }

        setEditingData((prev) => ({
            ...prev,
            props: prev.props.filter((_, itemIdx) => itemIdx !== idx),
        }));
    };

    return (
        <>
            <Accordion.Item
                value={"prop-" + idx}
                className={`${!modelValid ? "error" : ""}`}
            >
                <Accordion.Control>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "start",
                            flexDirection: "row",
                            height: "2.5rem",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "start",
                                flexDirection: "row",
                                marginRight: "0.5rem",
                            }}
                        >
                            <TagIcon
                                style={{
                                    color: "rgba(var(--secIcon))",
                                    fontSize: "1.4rem",
                                    marginBottom: "-0.1rem",
                                }}
                            />
                            <p
                                style={{
                                    color: "rgba(var(--secText))",
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                }}
                            >
                                {idx + 1}
                            </p>
                        </div>
                        <p>{prop}</p>
                    </div>
                </Accordion.Control>
                <Accordion.Panel>
                    {/* Prop */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1rem",
                        }}
                    >
                        <TextInput
                            icon={<FaBox />}
                            label={T("propLabel")}
                            value={prop}
                            error={
                                !modelValid
                                    ? T("invalidModelWarning")
                                    : undefined
                            }
                            onChange={(e) =>
                                setEditingData((prev) => ({
                                    ...prev,
                                    props: prev.props.map((item, i) =>
                                        i === idx
                                            ? {
                                                  ...item,
                                                  prop: e.target.value,
                                              }
                                            : item
                                    ),
                                }))
                            }
                        />
                        <NumberInput
                            icon={<PiBoneFill />}
                            label={T("propBone")}
                            value={bone}
                            hideControls
                            onChange={(e) => {
                                setEditingData((prev) => ({
                                    ...prev,
                                    props: prev.props.map((item, i) =>
                                        i === idx
                                            ? {
                                                  ...item,
                                                  bone: e,
                                              }
                                            : item
                                    ),
                                }));
                            }}
                        />
                    </div>

                    {/* Offset */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "1rem",
                        }}
                    >
                        <NumberInput
                            icon={<ZoomOutMapIcon />}
                            label={T("propOffsetX")}
                            value={offset.x}
                            precision={3}
                            hideControls
                            onChange={(e) => setValue("offset", "x", e)}
                        />
                        <NumberInput
                            icon={<ZoomOutMapIcon />}
                            label={T("propOffsetY")}
                            value={offset.y}
                            precision={3}
                            hideControls
                            onChange={(e) => setValue("offset", "y", e)}
                        />
                        <NumberInput
                            icon={<ZoomOutMapIcon />}
                            label={T("propOffsetZ")}
                            value={offset.z}
                            precision={3}
                            hideControls
                            onChange={(e) => setValue("offset", "z", e)}
                        />
                    </div>

                    {/* Rotation */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "1rem",
                        }}
                    >
                        <NumberInput
                            icon={<CropRotateIcon />}
                            label={T("propRotationX")}
                            value={rotation.x}
                            precision={3}
                            hideControls
                            onChange={(e) => setValue("rotation", "x", e)}
                        />
                        <NumberInput
                            icon={<CropRotateIcon />}
                            label={T("propRotationY")}
                            value={rotation.y}
                            precision={3}
                            hideControls
                            onChange={(e) => setValue("rotation", "y", e)}
                        />
                        <NumberInput
                            icon={<CropRotateIcon />}
                            label={T("propRotationZ")}
                            value={rotation.z}
                            precision={3}
                            hideControls
                            onChange={(e) => setValue("rotation", "z", e)}
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "end",
                            marginTop: "0.25rem",
                        }}
                    >
                        <Button
                            icon={<LuCrown />}
                            color="rgba(var(--blue2))"
                            onClick={makePrimary}
                            disabled={idx === 0}
                            hollow={idx === 0}
                            buttonStyling={{
                                marginRight: "0.75rem",
                            }}
                        >
                            {T("makePrimary")}
                        </Button>
                        <Button
                            icon={<DeleteIcon />}
                            color="rgba(var(--red3))"
                            disabled={totalProps <= 1}
                            hollow={totalProps <= 1}
                            onClick={async () => deleteProp()}
                        >
                            {T("deleteProp")}
                        </Button>
                    </div>
                </Accordion.Panel>
            </Accordion.Item>
        </>
    );
};

export default PropAlignments;

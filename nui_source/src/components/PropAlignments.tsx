import React from "react";

import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import CropRotateIcon from "@mui/icons-material/CropRotate";
import { useTranslation } from "../context/Translation";
import NumberInput from "./utils/NumberInput";
import { EditingData } from "../types";

const PropAlignments = ({
    editingData,
    setEditingData,
}: {
    editingData: EditingData;
    setEditingData: React.Dispatch<React.SetStateAction<EditingData>>;
}) => {
    const T = useTranslation();

    return (
        <>
            {/* Offset */}
            <p>{T("propOffsetTitle")}</p>
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
                    value={editingData.offset[0]}
                    precision={6}
                    hideControls
                    onChange={(e) => {
                        setEditingData((prev) => {
                            const offset: [number, number, number] = [
                                ...prev.offset,
                            ];
                            offset[0] = e;

                            return { ...prev, offset };
                        });
                    }}
                />
                <NumberInput
                    icon={<ZoomOutMapIcon />}
                    label={T("propOffsetY")}
                    value={editingData.offset[1]}
                    precision={6}
                    hideControls
                    onChange={(e) => {
                        setEditingData((prev) => {
                            const offset: [number, number, number] = [
                                ...prev.offset,
                            ];
                            offset[1] = e;

                            return { ...prev, offset };
                        });
                    }}
                />
                <NumberInput
                    icon={<ZoomOutMapIcon />}
                    label={T("propOffsetZ")}
                    value={editingData.offset[2]}
                    precision={6}
                    hideControls
                    onChange={(e) => {
                        setEditingData((prev) => {
                            const offset: [number, number, number] = [
                                ...prev.offset,
                            ];
                            offset[2] = e;

                            return { ...prev, offset };
                        });
                    }}
                />
            </div>

            {/* Rotation */}
            <p>{T("propRotationTitle")}</p>
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
                    value={editingData.rotation[0]}
                    precision={6}
                    hideControls
                    onChange={(e) => {
                        setEditingData((prev) => {
                            const rotation: [number, number, number] = [
                                ...prev.rotation,
                            ];
                            rotation[0] = e;

                            return { ...prev, rotation };
                        });
                    }}
                />
                <NumberInput
                    icon={<CropRotateIcon />}
                    label={T("propRotationY")}
                    value={editingData.rotation[1]}
                    precision={6}
                    hideControls
                    onChange={(e) => {
                        setEditingData((prev) => {
                            const rotation: [number, number, number] = [
                                ...prev.rotation,
                            ];
                            rotation[1] = e;

                            return { ...prev, rotation };
                        });
                    }}
                />
                <NumberInput
                    icon={<CropRotateIcon />}
                    label={T("propRotationZ")}
                    value={editingData.rotation[2]}
                    precision={6}
                    hideControls
                    onChange={(e) => {
                        setEditingData((prev) => {
                            const rotation: [number, number, number] = [
                                ...prev.rotation,
                            ];
                            rotation[2] = e;

                            return { ...prev, rotation };
                        });
                    }}
                />
            </div>
        </>
    );
};

export default PropAlignments;

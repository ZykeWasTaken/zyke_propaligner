import { useState } from "react";
import DropDown, { DropDownItemData } from "../utils/DropDown";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { useTranslation } from "../../context/Translation";
import { Box } from "@mantine/core";
import Button from "../utils/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { send } from "../utils/nui-events";
import LabelIcon from "@mui/icons-material/Label";
import { PresetData } from "../../types";

const PresetButton: React.FC<{
    presetData: PresetData;
    label: string;
    created: number;
    loadPreset: (data: PresetData) => void;
    overwritePreset: (id: string) => void;
    deletePreset: (id: string) => void;
}> = ({
    presetData,
    label,
    created,
    loadPreset,
    overwritePreset,
    deletePreset,
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const T = useTranslation();

    const availableOptions: DropDownItemData[] = [
        {
            label: T("presetButtonLoadTitle"),
            name: "load",
            icon: <FileDownloadIcon />,
            onClick: () => loadPreset(presetData),
        },
        {
            label: T("presetButtonOverwriteTitle"),
            name: "overwrite",
            icon: <UploadFileIcon />,
            onClick: () => overwritePreset(presetData.id),
        },
        {
            label: T("presetButtonExportJsonTitle"),
            name: "exportJson",
            icon: <UploadFileIcon />,
            onClick: () => send("ExportPresetJson", presetData),
        },
        {
            label: T("presetButtonDeleteTitle"),
            name: "delete",
            icon: <DeleteIcon />,
            onClick: () => deletePreset(presetData.id),
        },
    ];

    return (
        <div
            style={{
                width: "100%",
            }}
        >
            <DropDown
                items={availableOptions}
                open={open}
                setOpen={setOpen}
                position="bottom"
                styling={{
                    position: "absolute",
                }}
                closeOnClick
                itemComponent={(props) => {
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                gap: "0.3rem",
                                alignItems: "center",
                                width: "calc(100% - 2rem)",

                                "& p": {
                                    fontSize: "1.3rem",

                                    color: "rgba(var(--text))",
                                },

                                "& svg": {
                                    fontSize: "1.3rem",
                                },
                            }}
                        >
                            {props.icon}
                            <p>{props.label}</p>
                        </Box>
                    );
                }}
            >
                <Button
                    buttonStyling={{
                        width: "100%",
                    }}
                    icon={<LabelIcon />}
                    onClick={() => setOpen(!open)}
                    removeDefaultComponent
                >
                    <div
                        style={{
                            display: "flex",
                            gap: "0.3rem",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "calc(100% - 2rem)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <p
                                style={{
                                    fontSize: "1.3rem",
                                }}
                            >
                                {label || "MISSING LABEL"}
                            </p>
                        </div>
                        <p
                            style={{
                                color: "rgba(var(--secText))",
                                fontSize: "1.2rem",
                                marginRight: "2rem",
                            }}
                        >
                            {T("historyCreated", [
                                new Date(created * 1000).toLocaleString(),
                            ])}
                        </p>
                    </div>
                    <UnfoldMoreIcon
                        sx={{
                            fill: "rgba(var(--secIcon)) !important",
                            width: "1.5rem",
                            height: "1.5rem",
                            position: "absolute",
                            right: "0rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                        }}
                    />
                </Button>
            </DropDown>
        </div>
    );
};

export default PresetButton;

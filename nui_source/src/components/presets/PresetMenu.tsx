import React, { useEffect, useState } from "react";
import Modal from "../utils/Modal";
import { useTranslation } from "../../context/Translation";
import { useModalContext } from "../../context/ModalContext";
import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";
import Button from "../utils/Button";
import TextInput from "../utils/TextInput";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AvailablePresets from "./AvailablePresets";
import LabelIcon from "@mui/icons-material/Label";
import { callback } from "../utils/nui-events";
import DataObjectIcon from "@mui/icons-material/DataObject";
import DownloadIcon from "@mui/icons-material/Download";
import { LoadingOverlay } from "@mantine/core";
import { AlignmentData, NewPresetData, Preset } from "../../types";

const PresetMenu: React.FC<{
    getCurrentAlignmentData: () => AlignmentData;
    loadPreset: (data: Preset) => void;
}> = ({ getCurrentAlignmentData, loadPreset }) => {
    const T = useTranslation();
    const { openModal, modalsOpen } = useModalContext();
    const modalId = "presetMenu";
    const [loading, setLoading] = useState<boolean>(true);
    const [presets, setPresets] = useState<Array<Preset>>([]);
    const [deletionLoading, setDeletionLoading] = useState<boolean>(false);
    const [creationLoading, setCreationLoading] = useState<boolean>(false);
    const [importLoading, setImportLoading] = useState<boolean>(false);
    const [label, setLabel] = useState<string>("");
    const [importData, setImportData] = useState<string>("");
    const [totalPresets, setTotalPresets] = useState<number>(0); // Used to calculate total pages
    const [page, setPage] = useState<number>(1);
    const [pageLoading, setPageLoading] = useState<boolean>(false);

    const refreshPresetsForPage = (_page: number) => {
        callback("GetPresets", _page).then((res) => {
            setTotalPresets(res.totalPresets);
            setPresets(res.presets);
            setLoading(false);
            setPageLoading(false);
        });
    };

    useEffect(() => {
        if (!modalsOpen[modalId]) {
            setLoading(true);
            setCreationLoading(false);
            setPageLoading(false);
            setPage(1);

            return;
        }

        setPageLoading(true);
        setTimeout(() => {
            refreshPresetsForPage(page);
        }, 100);
    }, [modalsOpen[modalId], page]);

    const isValidPresetLabel = () => {
        const tempLabel = label.replace(/ /g, "");

        if (tempLabel.length <= 0) return false;
        if (tempLabel.length > 50) return false;

        return true;
    };

    const isValidImportData = () => {
        const trimmed = importData.replace(/ /g, "");

        if (trimmed.length <= 0) return false;
        if (trimmed.length > 5000) return false;

        try {
            const parsed = JSON.parse(importData);
            if (!parsed || !parsed.data) return false;
            if (parsed.data.props.length > 20) return false;
        } catch {
            return false;
        }

        return true;
    };

    const createPreset = async () => {
        setCreationLoading(true);

        const data: NewPresetData = {
            label,
            data: getCurrentAlignmentData(),
        };

        const createdPreset = await callback("CreatePreset", data);

        setTimeout(() => {
            if (createdPreset) {
                if (page !== 1) {
                    setPage(1);
                } else {
                    refreshPresetsForPage(page);
                }
            }

            setLabel("");
            setCreationLoading(false);
        }, 100);
    };

    const overwritePreset = async (id: string) => {
        setCreationLoading(true);

        // Created is irrelevant here, because it is overwritten server-side later on
        const data: Omit<Preset, "created"> = {
            label,
            id,
            last_used: Date.now(),
            data: getCurrentAlignmentData(),
        };

        const createdPreset = await callback("OverwritePreset", data);

        setTimeout(() => {
            if (createdPreset) {
                if (page !== 1) {
                    setPage(1);
                } else {
                    refreshPresetsForPage(page);
                }
            }

            setCreationLoading(false);
        }, 100);
    };

    const deletePreset = async (id: string) => {
        setDeletionLoading(true);
        await callback("DeletePreset", id);

        setTimeout(() => {
            setDeletionLoading(false);
            if (page !== 1) {
                setPage(1);
            } else {
                refreshPresetsForPage(page);
            }
        }, 100);
    };

    // JSON
    const importPreset = async (data: string) => {
        setImportLoading(true);
        const importedPreset = await callback("ImportPreset", data);

        setTimeout(() => {
            if (importedPreset) {
                setImportData("");
                if (page !== 1) {
                    setPage(1);
                } else {
                    refreshPresetsForPage(page);
                }
            }

            setImportLoading(false);
        }, 100);
    };

    return (
        <>
            <Button
                wide
                icon={<ControlPointDuplicateIcon />}
                onClick={() => openModal("presetMenu")}
            >
                {T("presetMenuTitle")}
            </Button>
            <Modal
                id={modalId}
                title={T("presetMenuTitle")}
                icon={<ControlPointDuplicateIcon />}
                closeButton
                modalStyling={{
                    width: "50rem",
                }}
                loading={loading}
            >
                <LoadingOverlay
                    visible={
                        pageLoading ||
                        creationLoading ||
                        deletionLoading ||
                        importLoading
                    }
                />

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: "0.75rem",
                        alignItems: "end",
                    }}
                >
                    <TextInput
                        label={T("presetLabelTitle")}
                        placeholder={T("presetLabelPlaceholder")}
                        icon={<LabelIcon />}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        disabled={creationLoading}
                    />
                    <Button
                        icon={<UploadFileIcon />}
                        wide
                        buttonStyling={{
                            marginBottom: "0.25rem",
                        }}
                        color={"var(--blue2)"}
                        onClick={() => createPreset()}
                        loading={creationLoading}
                        disabled={!isValidPresetLabel()}
                    >
                        {T("save")}
                    </Button>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: "0.75rem",
                        alignItems: "end",
                    }}
                >
                    <TextInput
                        label={T("importLabelTitle")}
                        placeholder={T("importLabelPlaceholder")}
                        icon={<DataObjectIcon />}
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        disabled={importLoading}
                    />
                    <Button
                        icon={<DownloadIcon />}
                        wide
                        buttonStyling={{
                            marginBottom: "0.25rem",
                        }}
                        color={"var(--blue2)"}
                        onClick={async () => await importPreset(importData)}
                        loading={importLoading}
                        disabled={!isValidImportData()}
                    >
                        {T("import")}
                    </Button>
                </div>

                <div
                    style={{
                        width: "40%",
                        height: "1px",
                        background: "rgba(var(--grey4))",
                        margin: "1.75rem auto 1.75rem auto",
                    }}
                />

                <AvailablePresets
                    presets={presets}
                    loadPreset={loadPreset}
                    overwritePreset={overwritePreset}
                    deletePreset={deletePreset}
                    totalPresets={totalPresets}
                    setPage={setPage}
                    page={page}
                    setPageLoading={setPageLoading}
                />
            </Modal>
        </>
    );
};

export default PresetMenu;

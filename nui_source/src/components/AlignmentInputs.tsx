import { useTranslation } from "../context/Translation";
import Button from "./utils/Button";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import { useState } from "react";
import { callback, send } from "./utils/nui-events";

import { FaBox } from "react-icons/fa6";
import { PiBoneFill } from "react-icons/pi";
import { MdAnimation } from "react-icons/md";
import PropAlignments from "./PropAlignments";
import NumberInput from "./utils/NumberInput";
import TextInput from "./utils/TextInput";

import HistoryIcon from "@mui/icons-material/History";
import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";
import { useModalContext } from "../context/ModalContext";
import History from "./History";
import { LoadingOverlay } from "@mantine/core";
import PresetMenu from "./presets/PresetMenu";
import { EditingData, HistoryData, Preset } from "../types";

// TODO: Remake bones to be a select with createable search, so there are default but you can make your own, if possible

const AlignmentInputs = () => {
    const T = useTranslation();
    const { openModal, closeModal } = useModalContext();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [editingData, setEditingData] = useState<EditingData>({
        // prop: "prop_ld_flow_bottle",
        // bone: 18905,
        // dict: "mp_player_intdrink",
        // clip: "loop_bottle",

        // offset: [0.122752, -0.038894, 0.033247],
        // rotation: [-103.202011, -68.066383, 2.814771],

        prop: "",
        bone: 0,
        dict: "",
        clip: "",
        offset: [0.0, 0.0, 0.0],
        rotation: [0.0, 0.0, 0.0],
    });
    const [loading, setLoading] = useState<boolean>(false);

    const handleForm = (e?: React.FormEvent<HTMLFormElement>): void => {
        if (submitting) return;

        setSubmitting(true);
        if (e) e.preventDefault();

        callback(
            "StartEditing",
            {
                ...editingData,
                offset: editingData.offset,
                rotation: editingData.rotation,
            },
            undefined
        ).then(() => {
            setSubmitting(false);
        });
    };

    const loadHistory = (data: HistoryData) => {
        setLoading(true);
        closeModal("loadHistory");

        setTimeout(() => {
            setLoading(false);
            setEditingData({
                ...data,
                offset: [data.offset[0], data.offset[1], data.offset[2]],
                rotation: [
                    data.rotation[0],
                    data.rotation[1],
                    data.rotation[2],
                ],
            });
        }, 300);
    };

    const loadPreset = (data: Preset) => {
        setLoading(true);
        closeModal("presetMenu");

        send("OnPresetLoad", data.id);

        setTimeout(() => {
            setLoading(false);
            setEditingData({
                prop: data.data.prop,
                bone: data.data.bone,
                dict: data.data.dict,
                clip: data.data.clip,
                offset: [
                    data.data.offset[0],
                    data.data.offset[1],
                    data.data.offset[2],
                ],
                rotation: [
                    data.data.rotation[0],
                    data.data.rotation[1],
                    data.data.rotation[2],
                ],
            });
        }, 300);
    };

    const getCurrentAlignmentData = () => {
        return editingData;
    };

    return (
        <>
            <LoadingOverlay visible={loading} />
            <div>
                <div
                    style={{
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                        marginBottom: "0.5rem",
                    }}
                >
                    <History loadHistory={loadHistory} />
                    <PresetMenu
                        getCurrentAlignmentData={getCurrentAlignmentData}
                        loadPreset={loadPreset}
                    />
                </div>
            </div>
            <form onSubmit={handleForm}>
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
                        value={editingData.prop}
                        onChange={(e) =>
                            setEditingData((prev) => ({
                                ...prev,
                                prop: e.target.value,
                            }))
                        }
                    />

                    <NumberInput
                        icon={<PiBoneFill />}
                        label={T("propBone")}
                        value={editingData.bone}
                        hideControls
                        onChange={(e) => {
                            setEditingData((prev) => ({
                                ...prev,
                                bone: e,
                            }));
                        }}
                    />
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                    }}
                >
                    <TextInput
                        icon={<MdAnimation />}
                        label={T("animationDict")}
                        value={editingData.dict}
                        onChange={(e) =>
                            setEditingData((prev) => ({
                                ...prev,
                                dict: e.target.value,
                            }))
                        }
                    />
                    <TextInput
                        icon={<MdAnimation />}
                        label={T("animationClip")}
                        value={editingData.clip}
                        onChange={(e) =>
                            setEditingData((prev) => ({
                                ...prev,
                                clip: e.target.value,
                            }))
                        }
                    />
                </div>

                <PropAlignments
                    editingData={editingData}
                    setEditingData={setEditingData}
                />

                <Button
                    icon={<ControlCameraIcon />}
                    color="var(--blue1)"
                    buttonStyling={{
                        width: "100%",
                    }}
                    textContainerStyling={{
                        justifyContent: "center",
                    }}
                    onClick={() => handleForm()}
                    loading={submitting}
                >
                    {T("startEditing")}
                </Button>
            </form>
        </>
    );
};

export default AlignmentInputs;

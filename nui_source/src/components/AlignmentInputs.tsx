import { useTranslation } from "../context/Translation";
import Button from "./utils/Button";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import { useEffect, useRef, useState } from "react";
import { callback, listen, send } from "./utils/nui-events";
import PropAlignments from "./PropAlignments";
import { useModalContext } from "../context/ModalContext";
import History from "./History";
import { Accordion, LoadingOverlay } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import PresetMenu from "./presets/PresetMenu";
import {
    AlignmentData,
    HistoryData,
    Preset,
    PropAlignmentData,
} from "../types";
import AnimationSection from "./inputs/AnimationSection";
import AddIcon from "@mui/icons-material/Add";

const AlignmentInputs = () => {
    const T = useTranslation();
    const { openModal, closeModal } = useModalContext();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [editingData, setEditingData] = useState<AlignmentData>({
        dict: "",
        clip: "",
        props: [],
    });
    const editingDataRef = useRef(editingData);

    const [loading, setLoading] = useState<boolean>(false);
    const [currProp, setCurrProp] = useState<string | null>(null);
    const [debouncedPropEditing] = useDebouncedValue(editingData.props, 500);
    const [hasInvalidModels, setHasInvalidModels] = useState(true);
    const isFirstRender = useRef(true);

    const handleForm = (e?: React.FormEvent<HTMLFormElement>): void => {
        if (submitting) return;

        setSubmitting(true);
        if (e) e.preventDefault();

        callback("StartEditing", { ...editingData }, undefined).then(() => {
            setSubmitting(false);
        });
    };

    const loadHistory = (data: HistoryData) => {
        setLoading(true);
        closeModal("loadHistory");

        setTimeout(() => {
            setLoading(false);
            setEditingData(data);
        }, 100);
    };

    const loadPreset = (data: Preset) => {
        setLoading(true);
        closeModal("presetMenu");

        send("OnPresetLoad", data.id);

        setTimeout(() => {
            setLoading(false);
            setEditingData({
                dict: data.data.dict,
                clip: data.data.clip,
                props: data.data.props,
            });
        }, 100);
    };

    const getCurrentAlignmentData = () => {
        return editingData;
    };

    const validateAllProps = async (): Promise<boolean> => {
        if (editingData.props.length === 0) return true;

        for (let i = 0; i < editingData.props.length; i++) {
            const prop = editingData.props[i].prop;
            if (!prop || prop === "") return false;

            const isValid = await callback(
                "ValidatePropModel",
                editingData.props[i].prop
            );

            if (!isValid) return false;
        }

        return true;
    };

    const addbaseProp = async () => {
        if (!(await validateAllProps())) {
            send("Notify", "invalidModels");

            return;
        }

        const newProp: PropAlignmentData = {
            prop: "",
            bone: 0,
            offset: { x: 0.0, y: 0.0, z: 0.0 },
            rotation: { x: 0.0, y: 0.0, z: 0.0 },
        };

        setEditingData((prev) => ({
            ...prev,
            props: [...prev.props, newProp],
        }));

        setHasInvalidModels(true);

        setTimeout(() => {
            setCurrProp("prop-" + editingData.props.length);
        }, 1);
    };

    // On load, create a base prop & open it
    useEffect(() => {
        if (editingData.props.length !== 0) return;

        addbaseProp();
        setCurrProp("prop-" + editingData.props.length);
    }, []);

    // Validate all prop models if nothing has been changed in a while
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        validateAllProps().then((val) => setHasInvalidModels(!val));
    }, [debouncedPropEditing]);

    listen("SetAlignmentData", (data) => {
        for (const key in data) {
            console.log(key);
        }

        setEditingData((prev) => ({
            ...prev,
            dict: data.dict,
            clip: data.clip,
            props: data.props,
        }));
    });

    useEffect(() => {
        editingDataRef.current = editingData;
    }, [editingData]);

    useEffect(() => {
        return () => {
            send("MenuUnmounted", {
                dict: editingDataRef.current.dict,
                clip: editingDataRef.current.clip,
                props: editingDataRef.current.props,
            });
        };
    }, []);

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
                <AnimationSection
                    editingData={editingData}
                    setEditingData={setEditingData}
                />

                <Accordion
                    value={currProp}
                    onChange={(id) => {
                        if (editingData.props.length === 0) return;
                        if (id === null) return;

                        setCurrProp(id);
                    }}
                >
                    {editingData.props.map((prop, idx) => (
                        <PropAlignments
                            key={"prop-" + idx}
                            idx={idx}
                            {...prop}
                            setEditingData={setEditingData}
                            totalProps={editingData.props.length}
                            setCurrProp={setCurrProp}
                        />
                    ))}
                </Accordion>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                    }}
                >
                    <Button
                        color="rgba(var(--blue2))"
                        icon={<AddIcon />}
                        onClick={async () => await addbaseProp()}
                        disabled={hasInvalidModels}
                    >
                        {T(
                            editingData.props.length > 0
                                ? "addMoreProps"
                                : "addFirstProp"
                        )}
                    </Button>
                </div>

                <div
                    style={{
                        width: "15rem",
                        height: "1px",
                        background: "rgba(var(--grey4))",
                        margin: "1.25rem auto",
                    }}
                />

                <Button
                    icon={<ControlCameraIcon />}
                    color="var(--blue2)"
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

import React from "react";
import TextInput from "../utils/TextInput";
import { MdAnimation } from "react-icons/md";
import { AlignmentData } from "../../types";
import { useTranslation } from "../../context/Translation";

const AnimationSection = ({
    editingData,
    setEditingData,
}: {
    editingData: AlignmentData;
    setEditingData: React.Dispatch<React.SetStateAction<AlignmentData>>;
}) => {
    const T = useTranslation();

    return (
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
    );
};

export default AnimationSection;

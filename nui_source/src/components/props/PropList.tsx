import React from "react";
import PropAlignments from "./PropAlignments";
import { AlignmentData, Bone } from "../../types";
import Button from "../utils/Button";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "../../context/Translation";
import SectionTitle from "../utils/SectionTitle";

interface PropListProps {
    editingData: AlignmentData;
    setEditingData: React.Dispatch<React.SetStateAction<AlignmentData>>;
    bones: Bone[];
    addbaseProp: () => Promise<void>;
    hasInvalidModels: boolean;
}

const PropList: React.FC<PropListProps> = ({
    editingData,
    setEditingData,
    bones,
    addbaseProp,
    hasInvalidModels,
}) => {
    const T = useTranslation();

    return (
        <>
            <SectionTitle text={T("propList")} />
            <div>
                {editingData.props.map((prop, idx) => (
                    <PropAlignments
                        key={"prop-" + prop.tempId}
                        idx={idx}
                        {...prop}
                        setEditingData={setEditingData}
                        totalProps={editingData.props.length}
                        bones={bones}
                    />
                ))}
            </div>

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
        </>
    );
};

export default PropList;

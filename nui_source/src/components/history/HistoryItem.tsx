import React from "react";
import Button from "../utils/Button";
import { HistoryData } from "../../types";
import { useTranslation } from "../../context/Translation";

interface HistoryItemProps {
    data: HistoryData;
    idx: number;
    loadHistory: (data: HistoryData) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
    data,
    idx,
    loadHistory,
}) => {
    const T = useTranslation();

    return (
        <Button
            onClick={() => loadHistory(data)}
            wide
            buttonStyling={{
                ...(idx === 0 && { margin: "0rem" }),
                height: "2.95rem",
            }}
            removeDefaultComponent
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        width: "30rem",
                    }}
                >
                    <p
                        className="truncate"
                        style={{
                            fontSize: "1.3rem",
                        }}
                    >
                        {T("historyModel", [
                            data.props.map((item) => item.prop).join(", "),
                        ])}
                    </p>
                </div>
                <p
                    style={{
                        color: "rgba(var(--secText))",
                        fontSize: "1.2rem",
                    }}
                >
                    {T("historyCreated", [
                        new Date(data.created * 1000).toLocaleString(),
                    ])}
                </p>
            </div>
        </Button>
    );
};

export default HistoryItem;

import React from "react";
import { HistoryData } from "../../types";
import HistoryItem from "./HistoryItem";

interface HistoryList {
    history: Array<HistoryData>;
    loadHistory: (data: HistoryData) => void;
}

const HistoryList: React.FC<HistoryList> = ({ history, loadHistory }) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                maxHeight: "40vh",
                overflowY: "scroll",
                minWidth: "45rem",
            }}
        >
            {history.map((data, idx) => (
                <HistoryItem
                    key={"history-" + idx}
                    data={data}
                    idx={idx}
                    loadHistory={loadHistory}
                />
            ))}
        </div>
    );
};

export default HistoryList;

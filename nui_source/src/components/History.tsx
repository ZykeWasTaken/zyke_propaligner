import { useEffect, useState } from "react";
import Modal from "./utils/Modal";
import { useTranslation } from "../context/Translation";
import { useModalContext } from "../context/ModalContext";
import { callback } from "./utils/nui-events";
import Button from "./utils/Button";
import HistoryIcon from "@mui/icons-material/History";
import { HistoryData } from "../types";

const History = ({
    loadHistory,
}: {
    loadHistory: (data: HistoryData) => void;
}) => {
    const T = useTranslation();
    const [history, setHistory] = useState<Array<HistoryData>>([]);
    const { modalsOpen } = useModalContext();
    const modalId = "loadHistory";
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!modalsOpen[modalId]) return setLoading(true);

        setTimeout(() => {
            callback("GetHistory").then((res) => {
                setHistory(res);
                setLoading(false);
            });
        }, 300);
    }, [modalsOpen[modalId]]);

    return (
        <Modal
            id={modalId}
            title={T("loadHistoryTitle")}
            icon={<HistoryIcon />}
            closeButton
            loading={loading}
        >
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
                    <Button
                        key={"history-" + idx}
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
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "1.3rem",
                                    }}
                                >
                                    {T("historyModel", [data.prop])}
                                </p>
                            </div>
                            <p
                                style={{
                                    color: "rgba(var(--secText))",
                                    fontSize: "1.2rem",
                                    // marginRight: "2rem",
                                }}
                            >
                                {T("historyCreated", [
                                    new Date(
                                        data.created * 1000
                                    ).toLocaleString(),
                                ])}
                            </p>
                        </div>
                    </Button>
                ))}
            </div>
        </Modal>
    );
};

export default History;

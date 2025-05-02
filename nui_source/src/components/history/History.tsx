import { useEffect, useState } from "react";
import Modal from "../utils/Modal";
import { useTranslation } from "../../context/Translation";
import { useModalContext } from "../../context/ModalContext";
import { callback } from "../utils/nui-events";
import Button from "../utils/Button";
import HistoryIcon from "@mui/icons-material/History";
import { HistoryData } from "../../types";
import HistoryList from "./HistoryList";

interface HistoryProps {
    loadHistory: (data: HistoryData) => void;
}

const History: React.FC<HistoryProps> = ({ loadHistory }) => {
    const T = useTranslation();
    const [history, setHistory] = useState<Array<HistoryData>>([]);
    const { openModal, modalsOpen } = useModalContext();
    const modalId = "loadHistory";
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!modalsOpen[modalId]) return setLoading(true);

        setTimeout(() => {
            callback("GetHistory").then((res) => {
                setHistory(res);
                setLoading(false);
            });
        }, 100);
    }, [modalsOpen[modalId]]);

    return (
        <>
            <Button
                wide
                icon={<HistoryIcon />}
                onClick={() => openModal("loadHistory")}
            >
                {T("loadHistoryTitle")}
            </Button>

            <Modal
                id={modalId}
                title={T("loadHistoryTitle")}
                icon={<HistoryIcon />}
                closeButton
                loading={loading}
            >
                <HistoryList history={history} loadHistory={loadHistory} />
            </Modal>
        </>
    );
};

export default History;

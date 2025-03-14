import { listen, send } from "./utils/nui-events";
import AlignmentInputs from "./AlignmentInputs";
import { useTranslation } from "../context/Translation";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import Modal from "./utils/Modal";
import { useModalContext } from "../context/ModalContext";

const MainMenu = () => {
    const T = useTranslation();
    const { openModal, closeModal } = useModalContext();

    listen("SetOpen", (val: boolean) => {
        if (val) {
            openModal("mainMenu");
        } else {
            closeModal("mainMenu");
        }
    });

    return (
        <>
            <Modal
                id="mainMenu"
                icon={<ControlCameraIcon />}
                title={T("propAlignerTitle")}
                onClose={() => send("CloseMenu", undefined, undefined)}
                closeButton
                modalStyling={{
                    width: "60rem",
                }}
            >
                <AlignmentInputs />
            </Modal>
        </>
    );
};

export default MainMenu;

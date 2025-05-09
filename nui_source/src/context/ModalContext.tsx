import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { OpenedModal } from "../types";

interface ModalContextType {
    modalsOpen: { [key: string]: OpenedModal };
    modalQueue: string[];
    isModalOpen: (name: string) => boolean;
    openModal: (name: string, canClose?: boolean, onClose?: () => void) => void;
    closeModal: (name?: string) => void;
    hasModalsOpen: () => boolean;
    setModalData: (name: string, data: { [key: string]: any }) => void;
    suspendModals: () => void;
    unsuspendModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = (): ModalContextType => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModalContext must be used within a ModalProvider");
    }

    return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const modalIdx = useRef(0);

    const [modalsOpen, setModalsOpen] = useState<{
        [key: string]: OpenedModal;
    }>({});
    const [modalQueue, setModalQueue] = useState<string[]>([]);

    const isModalOpen = (name: string) => {
        return modalsOpen[name] !== undefined;
    };

    const openModal = (
        name: string,
        canClose?: boolean,
        onClose?: () => void
    ) => {
        modalIdx.current = modalIdx.current + 1;
        setModalsOpen((prev) => ({
            ...prev,
            [name]: {
                canClose: canClose || true,
                onClose: onClose !== undefined ? onClose : null,
                suspended: false,
                idx: modalIdx.current,
            },
        }));
        setModalQueue((prev) => [...prev, name]);
    };

    // If no name is provided, close the last opened modal
    const closeModal = (name?: string) => {
        let chosenName = name as string;
        if (!chosenName) {
            chosenName = modalQueue[modalQueue.length - 1];
        }

        if (!chosenName) return;

        const modal = modalsOpen[chosenName];
        if (!modal) return;

        if (modal.onClose) modal.onClose();

        if (!modal.canClose) return;

        setModalsOpen((prev) => {
            const { [chosenName]: _, ...rest } = prev;
            return rest;
        });

        setModalQueue((prev) => prev.filter((modal) => modal !== chosenName));
    };

    const setModalData = (name: string, data: { [key: string]: any }) => {
        const modal = modalsOpen[name];
        if (!modal) return;

        setModalsOpen((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                ...data,
            },
        }));
    };

    const hasModalsOpen = () => {
        return modalQueue.length > 0;
    };

    const suspendModals = () => {
        const newModals: { [key: string]: OpenedModal } = {};

        for (const modalId in modalsOpen) {
            newModals[modalId] = {
                ...modalsOpen[modalId],
                suspended: true,
            };
        }

        setModalsOpen(newModals);
    };

    const unsuspendModals = () => {
        const newModals: { [key: string]: OpenedModal } = {};

        for (const modalId in modalsOpen) {
            newModals[modalId] = {
                ...modalsOpen[modalId],
                suspended: false,
            };
        }

        setModalsOpen(newModals);
    };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [modalsOpen]);

    return (
        <ModalContext.Provider
            value={{
                modalsOpen,
                modalQueue,
                isModalOpen,
                openModal,
                closeModal,
                hasModalsOpen,
                setModalData,
                suspendModals,
                unsuspendModals,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};

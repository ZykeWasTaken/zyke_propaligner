import { useEffect, useState } from "react";
import { callback } from "../components/utils/nui-events";

const EnsureLoader = ({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element | null => {
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (hasLoaded) return;

        const checkLoadedStatus = async () => {
            let timer: ReturnType<typeof setTimeout> | undefined;

            try {
                timer = setTimeout(() => {
                    throw new Error("Timeout");
                }, 1000);

                const res = await callback("RetrieveLoadedStatus");
                setHasLoaded(res as boolean);
                if (timer) clearTimeout(timer);

                return true;
            } catch (err) {
                if (timer) clearTimeout(timer);

                return false;
            }
        };

        const retryInterval = setInterval(async () => {
            const success = await checkLoadedStatus();
            if (success) {
                clearInterval(retryInterval);
            }
        }, 1000);

        return () => {
            clearInterval(retryInterval);
        };
    }, []);

    return hasLoaded && children ? <>{children}</> : null;
};

export default EnsureLoader;

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { callback } from "../components/utils/nui-events";

type ConfigType = { [key: string]: any };

const ConfigContext = createContext<ConfigType>({});

export const useConfig = (): ConfigType => {
    return useContext(ConfigContext);
};

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [config, setConfig] = useState<ConfigType | null>(null);

    useEffect(() => {
        callback("GetConfig").then((res) => setConfig(res));
    }, []);

    if (!config) return null;

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
};

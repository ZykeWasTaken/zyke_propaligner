import React, { createContext, useContext, useEffect, useState } from "react";
import { callback } from "../components/utils/nui-events";

const TranslationContext = createContext<
    (key: string, formatting?: Array<string>) => string
>(() => "TRANSLATIONS NOT LOADED");
export const useTranslation = () => useContext(TranslationContext);

interface TranslationStrings {
    [key: string]: string;
}

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [strings, setStrings] = useState<TranslationStrings | undefined>(
        undefined
    );

    const T = (key: string, formatting: Array<string> | undefined): string => {
        if (!strings) return "TRANSLATIONS NOT LOADED";

        const translation = strings[key] || "MISSING TRANSLATION: " + key;

        if (formatting && formatting.length > 0) {
            return translation.replace(/%s/g, (match) => {
                if (formatting.length > 0) {
                    return formatting.shift() || match;
                }

                return match;
            });
        }

        return translation;
    };

    useEffect(() => {
        callback("GetStrings").then((res) => {
            setStrings(res);
        });
    }, []);

    return strings ? (
        <TranslationContext.Provider value={T}>
            {children}
        </TranslationContext.Provider>
    ) : null;
};

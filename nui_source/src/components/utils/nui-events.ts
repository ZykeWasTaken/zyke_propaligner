import { MutableRefObject, useEffect, useRef } from "react";

interface NuiMessageData<T = unknown> {
    event: string;
    data: T;
}

const resName = "zyke_propaligner";

type NuiHandlerSignature<T> = (data: T) => void;

export const listen = (event: string, handler: (data: any) => void) => {
    const savedHandler: MutableRefObject<NuiHandlerSignature<any>> = useRef(
        () => {}
    );

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const eventListener = (e: MessageEvent<NuiMessageData<any>>) => {
            const { event: _event, data } = e.data;

            if (_event === event && savedHandler.current)
                savedHandler.current(data);
        };

        window.addEventListener("message", eventListener);

        return () => {
            window.removeEventListener("message", eventListener);
        };
    }, [event]);
};

export async function send(event: string, data?: any, subEvent?: string) {
    const eventName = `https://${resName}/Eventhandler${
        subEvent ? ":" + subEvent : ""
    }`;

    return fetch(eventName, {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            event: event,
            data: data || {},
        }),
    });
}

export async function callback(event: string, data?: any, subEvent?: string) {
    const eventName = `https://${resName}/Eventhandler${
        subEvent ? ":" + subEvent : ""
    }`;

    return fetch(eventName, {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            event: event,
            data: data || {},
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        });
}

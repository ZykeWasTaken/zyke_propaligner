import { Suspense, useRef, useState, useEffect } from "react";
import { TransformControls } from "@react-three/drei";
import { Mesh, MathUtils } from "three";
import { listen, send } from "../utils/nui-events";

type alignmentMode = "prop" | "particle";

interface GizmoReset {
    handle: null;
}

interface GizmoData {
    handle: number | null;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    currMode: alignmentMode;
}

export const TransformComponent = () => {
    const mesh = useRef<Mesh>(null!);
    const [currentEntity, setCurrentEntity] = useState<number | null>();
    const [currMode, setCurrMode] = useState<alignmentMode>("prop");
    const [editorMode, setEditorMode] = useState<
        "translate" | "rotate" | undefined
    >("translate");

    const handleObjectDataUpdate = () => {
        const entity = {
            handle: currentEntity,
            position: {
                x: mesh.current.position.x,
                y: -mesh.current.position.z,
                z: mesh.current.position.y,
            },
            rotation: {
                x: MathUtils.radToDeg(-mesh.current.rotation.x),
                y: MathUtils.radToDeg(mesh.current.rotation.y),
                z: MathUtils.radToDeg(mesh.current.rotation.z),
            },
        };

        send("moveEntity", entity, "moveEntity");
    };

    listen("setGizmoEntity", (entity: GizmoReset | GizmoData) => {
        setCurrentEntity(entity.handle);
        if (!entity.handle) return;

        setCurrMode(entity.currMode);

        // If we're switching to particle, make sure we're in translate mode
        if (entity.currMode == "particle" && editorMode === "rotate") {
            setEditorMode("translate");
        }

        mesh.current.position.set(
            entity.position.x,
            entity.position.z,
            -entity.position.y
        );
        mesh.current.rotation.order = "YZX";

        mesh.current.rotation.set(
            MathUtils.degToRad(entity.rotation.x),
            MathUtils.degToRad(entity.rotation.z),
            MathUtils.degToRad(entity.rotation.y)
        );
    });

    useEffect(() => {
        const keyHandler = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyR":
                    if (currMode === "particle") return;

                    const newMode =
                        editorMode === "rotate" ? "translate" : "rotate";

                    setEditorMode(newMode);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", keyHandler);
        return () => window.removeEventListener("keydown", keyHandler);
    }, [editorMode, currMode]);

    return (
        <>
            <Suspense fallback={<p>Loading Gizmo</p>}>
                {currentEntity != null && (
                    <TransformControls
                        size={0.5}
                        object={mesh}
                        mode={editorMode}
                        onObjectChange={handleObjectDataUpdate}
                    />
                )}
                <mesh ref={mesh} />
            </Suspense>
        </>
    );
};

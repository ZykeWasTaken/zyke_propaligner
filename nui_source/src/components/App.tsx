import { ThreeComponent } from "./alignment_controls/ThreeComponent";
import MainMenu from "./MainMenu";
import { TranslationProvider } from "../context/Translation";
import { ModalProvider } from "../context/ModalContext";
import { ConfigProvider } from "../context/ConfigContext";

function App() {
    return (
        <TranslationProvider>
            <ConfigProvider>
                <ModalProvider>
                    <div style={{ width: "100vw", height: "100vh" }}>
                        <ThreeComponent />

                        <MainMenu />
                    </div>
                </ModalProvider>
            </ConfigProvider>
        </TranslationProvider>
    );
}

export default App;

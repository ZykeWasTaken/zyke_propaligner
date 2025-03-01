import { useTranslation } from "../../context/Translation";
import { Pagination } from "@mantine/core";
import PresetButton from "./PresetButton";
import { useConfig } from "../../context/ConfigContext";
import { Preset } from "../../types";

const AvailablePresets = ({
    presets,
    loadPreset,
    overwritePreset,
    deletePreset,
    page,
    setPage,
    totalPresets,
    setPageLoading,
}: {
    presets: Array<Preset>;
    loadPreset: (data: Preset) => void;
    overwritePreset: (id: string) => void;
    deletePreset: (id: string) => void;
    page: number;
    setPage: (newPage: number) => void;
    totalPresets: number;
    setPageLoading: (loading: boolean) => void;
}) => {
    const T = useTranslation();
    const config = useConfig();

    const totalPages =
        totalPresets % config.Settings.presetsPerPage > 0
            ? Math.floor(totalPresets / config.Settings.presetsPerPage) + 1
            : Math.floor(totalPresets / config.Settings.presetsPerPage);

    return (
        <div>
            {presets.length > 0 ? (
                <>
                    {presets.map((data) => (
                        <PresetButton
                            key={"preset-" + data.id}
                            presetData={data}
                            {...data}
                            loadPreset={loadPreset}
                            overwritePreset={overwritePreset}
                            deletePreset={deletePreset}
                        />
                    ))}

                    <div
                        style={{
                            marginTop: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "end",
                        }}
                    >
                        <Pagination
                            total={totalPages}
                            value={page}
                            onChange={(newPage) => {
                                setPageLoading(true);
                                setPage(newPage);
                            }}
                        />
                    </div>
                </>
            ) : (
                <p
                    style={{
                        color: "rgba(var(--secText)",
                        fontSize: "1.4rem",
                        textAlign: "center",
                        marginBottom: "0.7rem",
                    }}
                >
                    {T("noPresetsAvailable")}
                </p>
            )}
        </div>
    );
};

export default AvailablePresets;

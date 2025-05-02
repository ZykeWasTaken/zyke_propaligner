const SectionTitle = ({
    text,
    ignoreSpacing,
    secondaryComponent,
}: {
    text: string;
    ignoreSpacing?: boolean;
    secondaryComponent?: React.ReactNode;
}) => {
    const dividerProps = {
        background: "rgba(var(--grey), 1.0)",
        height: "2px",
        borderRadius: "10rem",
    };

    const sideWidth = "3rem";
    const dividerSpacing = "1rem";

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginTop: !ignoreSpacing ? "1rem" : undefined,
                width: "100%",
            }}
        >
            <div
                style={{
                    width: sideWidth,
                    ...dividerProps,
                }}
            />
            <p
                style={{
                    fontSize: "1.8rem",
                    fontWeight: "500",
                    marginLeft: dividerSpacing,
                    marginRight: dividerSpacing,
                    color: "rgba(var(--secText))",
                    whiteSpace: "nowrap",
                }}
            >
                {text}
            </p>

            {!secondaryComponent ? (
                <div
                    style={{
                        width: "100%",
                        ...dividerProps,
                    }}
                />
            ) : (
                <>
                    <div
                        style={{
                            flexGrow: 1,
                            ...dividerProps,
                        }}
                    />
                    <div
                        style={{
                            marginLeft: dividerSpacing,
                            marginRight: dividerSpacing,
                        }}
                    >
                        {secondaryComponent}
                    </div>
                    <div
                        style={{
                            width: sideWidth,
                            ...dividerProps,
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default SectionTitle;

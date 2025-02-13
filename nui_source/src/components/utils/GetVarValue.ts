const isRgba = (input: string) => {
    return /^(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0|1|0?\.\d+)$/.test(input);
};

export default function GetVarValue(value: string): string {
    const startIndex = value.indexOf("--");

    if (startIndex !== -1) {
        const containsRgb = value.indexOf("rgb") !== -1;
        const lengthToSlice = containsRgb ? value.length - 2 : -1;
        const extractedValue = value.slice(startIndex, lengthToSlice).trim();
        const root = document.querySelector(":root");

        if (root) {
            const fetchedColor = getComputedStyle(root)
                .getPropertyValue(extractedValue)
                .trim();

            const _isRgba = isRgba(fetchedColor);

            return _isRgba ? `rgba(${fetchedColor})` : `rgb(${fetchedColor})`;
        } else {
            return "rgb(255, 0, 0)";
        }
    }

    return value;
}

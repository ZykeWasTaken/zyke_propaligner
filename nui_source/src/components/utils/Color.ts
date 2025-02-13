import chroma from "chroma-js";
import GetVarValue from "./GetVarValue";

const color = (value: string) => {
    const [r, g, b] = GetVarValue(value)
        .split(",")
        .map((value) => Number(value.trim()));

    return chroma(r, g, b);
};

export default color;

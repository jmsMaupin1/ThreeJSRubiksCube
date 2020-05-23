import { nearlyEqual } from "./utils";

export const layer_filter_map = (cubieSize, cubieSpacing) => {
    return {
        U: ({x, y, z}) => nearlyEqual(
            y,
            (cubieSize + cubieSpacing)
        ),
        u: ({x, y, z}) => {
            let ULayer = nearlyEqual(y, (cubieSize + cubieSpacing));
            let ELayer = nearlyEqual(y, 0);

            return ULayer || ELayer;
        },
        D: ({x, y, z}) => nearlyEqual(
            y,
            -(cubieSize + cubieSpacing)
        ),
        d: ({x, y, z}) => {
            let DLayer = nearlyEqual(y, -(cubieSize + cubieSpacing));
            let ELayer = nearlyEqual(y, 0);

            return DLayer || ELayer;
        },
        E: ({x, y, z}) => nearlyEqual(
            y,
            0
        ),
        L: ({x, y, z}) => nearlyEqual(
            x,
            -(cubieSize + cubieSpacing)
        ),
        l: ({x, y, z}) => {
            let LLayer = nearlyEqual(x, -(cubieSize + cubieSpacing));
            let MLayer = nearlyEqual(x, 0);

            return LLayer || MLayer;
        },
        R: ({x, y, z}) => nearlyEqual(
            x,
            (cubieSize + cubieSpacing)
        ),
        r: ({x, y, z}) => {
            let RLayer = nearlyEqual(x, (cubieSize + cubieSpacing));
            let MLayer = nearlyEqual(x, 0);

            return RLayer || MLayer;
        },
        M: ({x, y, z}) => nearlyEqual(
            x,
            0
        ),
        F: ({x, y, z}) => nearlyEqual(
            z,
            (cubieSize + cubieSpacing)
        ),
        f: ({x, y, z}) => {
            let FLayer = nearlyEqual(z, (cubieSize + cubieSpacing));
            let SLayer = nearlyEqual(z, 0);

            return FLayer || SLayer
        },
        B: ({x, y, z}) => nearlyEqual(
            z,
            -(cubieSize + cubieSpacing)
        ),
        b: ({x, y, z}) => {
            let BLayer = nearlyEqual(z, -(cubieSize + cubieSpacing));
            let SLayer = nearlyEqual(z, 0);

            return BLayer || SLayer;
        },
        S: ({x, y, z}) => nearlyEqual(
            z,
            0
        )
    }
}

export const face_color_map = {
    inside: 0x050505,
    U:  0xffff00,
    D:  0xffffff,
    R:  0xff0000,
    L:  0xff5c00,
    F:  0x0000ff,
    B:  0x00ff00
}

export const axis_map = {
    L: 'x',
    l: 'x',
    R: 'x',
    r: 'x',
    M: 'x',
    F: 'z',
    f: 'z',
    B: 'z',
    b: 'z',
    S: 'z',
    U: 'y',
    u: 'y',
    D: 'y',
    d: 'y',
    E: 'y'

}

export const direction_map = {
    L: 2,
    l: 2,
    R: -2,
    r: -2,
    M: 2,
    F: -2,
    f: -2,
    B: 2,
    b: 2,
    S: -2,
    U: -2,
    u: -2,
    D: 2,
    d: 2,
    E: 2,
}
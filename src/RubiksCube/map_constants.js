import { nearlyEqual } from "./utils";

export const layer_filter_map = (cubieSize, cubieSpacing) => {
    return {
        U: ({x, y, z}) => nearlyEqual(
            y,
            (cubieSize + cubieSpacing)
        ),
        D: ({x, y, z}) => nearlyEqual(
            y,
            -(cubieSize + cubieSpacing)
        ),
        L: ({x, y, z}) => nearlyEqual(
            x,
            -(cubieSize + cubieSpacing)
        ),
        R: ({x, y, z}) => nearlyEqual(
            x,
            (cubieSize + cubieSpacing)
        ),
        F: ({x, y, z}) => nearlyEqual(
            z,
            (cubieSize + cubieSpacing)
        ),
        B: ({x, y, z}) => nearlyEqual(
            z,
            -(cubieSize + cubieSpacing)
        )
    }
}

export const face_map = {
    right: 0,
    left: 1,
    top: 2,
    bottom: 3,
    front: 4,
    back: 5 
}

export const face_color_map = {
    inside: 0x2c2c2c,
    top:  0xffff00,
    bottom:  0xffffff,
    right:  0xff0000,
    left:  0xff8c00,
    front:  0x0000ff,
    back:  0x00ff00
}

export const axis_map = {
    L: 'x',
    R: 'x',
    F: 'z',
    B: 'z',
    U: 'y',
    D: 'y'

}

export const direction_map = {
    L: 2,
    R: -2,
    F: -2,
    B: 2,
    U: -2,
    D: 2
}
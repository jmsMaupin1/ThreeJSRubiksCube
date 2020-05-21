export function nearlyEqual(n, target, distance_allowed = .1) {
    return Math.abs(target - n) <= distance_allowed;
}
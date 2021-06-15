export default class Point {
    // #region Properties (2)

    public x: number;
    public y: number;

    // #endregion Properties (2)

    // #region Constructors (1)

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // #endregion Constructors (1)

    // #region Public Methods (1)

    public equals(other: Point) {
        return this.x === other.x && this.y === other.y;
    }

    // #endregion Public Methods (1)
}

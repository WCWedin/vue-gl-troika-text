declare module 'troika-three-text' {
  import { Color, Mesh, Vector2, Vector3, DataTexture } from 'three';

  export type colorInitializer = string | number | Color;

  /**
   * Format of the result from `getTextRenderInfo`
   */
  export type TroikaTextRenderInfo = {
    /**The normalized input arguments to the render call. */
    parameters: {
      text: string,
      font: string | null,
      fontSize: number,
      letterSpacing: number,
      lineHeight: string | number,
      maxWidth: number,
      direction: string,
      textAlign: string,
      textIndent: number,
      whiteSpace: string,
      overflowWrap: string,
      anchorX: string | number,
      anchorY: string | number,
      colorRanges: { [index: number]: colorInitializer } | null,
      includeCaretPositions: boolean,
      sdfGlyphSize: number | null
    },
    /** The SDF atlas texture. */
    sdfTexture: DataTexture
    /** The size of each glyph's SDF; see `configureTextBuilder`. */
    sdfGlyphSize: number
    /** The exponent used in encoding the SDF's values; see `configureTextBuilder`. */
    sdfExponent: number
    /** List of [minX, minY, maxX, maxY] quad bounds for each glyph. */
     glyphBounds: Float32Array
     /** List holding each glyph's index in the SDF atlas. */
     glyphAtlasIndices: Float32Array
     /** List holding each glyph's [r, g, b] color, if `colorRanges` was supplied. */
     glyphColors: Uint8Array
     /**
      * A list of caret positions for all glyphs; this is the bottom [x,y] of the
      * cursor position before each char, plus one after the last char.
      */
     caretPositions: Float32Array
     /** An appropriate height for all selection carets. */
     caretHeight: number
     /** The font's ascender metric. */
     ascender: number
     /** The font's descender metric. */
     descender: number
     /** The final computed lineHeight measurement. */
     lineHeight: number
     /** The y position of the top line's baseline. */
     topBaseline: number
     /**
      * The total [minX, minY, maxX, maxY] rect of the whole text block; this can
      * include extra vertical space beyond the visible glyphs due to lineHeight,
      * and is equivalent to the dimensions of a block-level text element in CSS.
      */
     blockBounds: Array<number>
     /**
      * The total [minX, minY, maxX, maxY] rect of the whole text block;
      * unlike `blockBounds` this is tightly wrapped to the visible glyph paths.
      */
     visibleBounds: Array<number>
     /**
      * List of bounding rects for each consecutive set of N glyphs,
      * in the format `{start:N, end:N, rect:[minX, minY, maxX, maxY]}`.
      */
     chunkedBounds: Array<{start: number, end: number, rect:number[]}>
     /**
      * Timing info for various parts of the rendering logic
      * including SDF generation, layout, etc.
      */
     timings: { total: number, fontLoad: number, layout: number, sdf: { [index: string]: number }, sdfTotal: number }
  }

  /**
   * A ThreeJS Mesh that renders a string of text on a plane in 3D space using signed distance
   * fields (SDF).
   */
  export class Text extends Mesh {
    constructor();

    // === Text layout properties: === //

    /**
     * @default ''
     * The string of text to be rendered.
     */
    text: string;

    /**
     * @default 0
     * Defines the horizontal position in the text block that should line up with the local origin.
     * Can be specified as a numeric x position in local units, a string percentage of the total
     * text block width e.g. `'25%'`, or one of the following keyword strings: 'left', 'center',
     * or 'right'.
     */
    anchorX: string | number;

    /**
     * @default 0
     * Defines the vertical position in the text block that should line up with the local origin.
     * Can be specified as a numeric y position in local units (note: down is negative y), a string
     * percentage of the total text block height e.g. `'25%'`, or one of the following keyword strings:
     * 'top', 'top-baseline', 'middle', 'bottom-baseline', or 'bottom'.
     */
    anchorY: string | number;

    /**
     * @default 0
     * Defines a cylindrical radius along which the text's plane will be curved. Positive numbers put
     * the cylinder's centerline (oriented vertically) that distance in front of the text, for a concave
     * curvature, while negative numbers put it behind the text for a convex curvature. The centerline
     * will be aligned with the text's local origin; you can use `anchorX` to offset it.
     *
     * Since each glyph is by default rendered with a simple quad, each glyph remains a flat plane
     * internally. You can use `glyphGeometryDetail` to add more vertices for curvature inside glyphs.
     */
    curveRadius: number;

    /**
     * @default 'auto'
     * Sets the base direction for the text. The default value of "auto" will choose a direction based
     * on the text's content according to the bidi spec. A value of "ltr" or "rtl" will force the direction.
     */
    direction: string;

    /**
     * @default null
     * URL of a custom font to be used. Font files can be any of the formats supported by
     * OpenType (see https://github.com/opentypejs/opentype.js).
     * Defaults to the Roboto font loaded from Google Fonts.
     */
    font: string | null;

    /**
     * @default 0.1
     * The size at which to render the font in local units; corresponds to the em-box height
     * of the chosen `font`.
     */
    fontSize: number;

    /**
     * @default 0
     * Sets a uniform adjustment to spacing between letters after kerning is applied. Positive
     * numbers increase spacing and negative numbers decrease it.
     */
    letterSpacing: number;

    /**
     * @default 'normal'
     * Sets the height of each line of text, as a multiple of the `fontSize`. Defaults to 'normal'
     * which chooses a reasonable height based on the chosen font's ascender/descender metrics.
     */
    lineHeight: string | number;

    /**
     * @default Infinity
     * The maximum width of the text block, above which text may start wrapping according to the
     * `whiteSpace` and `overflowWrap` properties.
     */
    maxWidth: number;

    /**
     * @default 'normal'
     * Defines how text wraps if the `whiteSpace` property is `normal`. Can be either `'normal'`
     * to break at whitespace characters, or `'break-word'` to allow breaking within words.
     * Defaults to `'normal'`.
     */
    overflowWrap: string;

    /**
     * @default 'left'
     * The horizontal alignment of each line of text within the overall text bounding box.
     */
    textAlign: string;

    /**
     * @default 0
     * Indentation for the first character of a line; see CSS `text-indent`.
     */
    textIndent: number;

    /**
     * @default 'normal'
     * Defines whether text should wrap when a line reaches the `maxWidth`. Can
     * be either `'normal'` (the default), to allow wrapping according to the `overflowWrap` property,
     * or `'nowrap'` to prevent wrapping. Note that `'normal'` here honors newline characters to
     * manually break lines, making it behave more like `'pre-wrap'` does in CSS.
     */
    whiteSpace: string;

    // === Presentation properties: === //

    /**
     * @default null
     * This is a shortcut for setting the `color` of the text's material. You can use this
     * if you don't want to specify a whole custom `material`. Also, if you do use a custom
     * `material`, this color will only be used for this particuar Text instance, even if
     * that same material instance is shared across multiple Text objects.
     */
    color: colorInitializer | null;

    /**
     * @default null
     * WARNING: This API is experimental and may change.
     * This allows more fine-grained control of colors for individual or ranges of characters,
     * taking precedence over the material's `color`. Its format is an Object whose keys each
     * define a starting character index for a range, and whose values are the color for each
     * range. The color value can be a numeric hex color value, a `THREE.Color` object, or
     * any of the strings accepted by `THREE.Color`.
     */
    colorRanges: { [index: number]: colorInitializer } | null;

    /**
     * @default 0
     * WARNING: This API is experimental and may change.
     * The width of an outline/halo to be drawn around each text glyph using the `outlineColor` and `outlineOpacity`.
     * Can be specified as either an absolute number in local units, or as a percentage string e.g.
     * `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`, which means
     * no outline will be drawn unless an `outlineOffsetX/Y` or `outlineBlur` is set.
     */
    outlineWidth: string | number;

    /**
     * @default 0x000000
     * WARNING: This API is experimental and may change.
     * The color of the text outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
     * Defaults to black.
     */
    outlineColor: colorInitializer;

    /**
     * @default 1
     * WARNING: This API is experimental and may change.
     * The opacity of the outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
     * Defaults to `1`.
     */
    outlineOpacity: number;

    /**
     * @default 0
     * WARNING: This API is experimental and may change.
     * A blur radius applied to the outer edge of the text's outline. If the `outlineWidth` is
     * zero, the blur will be applied at the glyph edge, like CSS's `text-shadow` blur radius.
     * Can be specified as either an absolute number in local units, or as a percentage string e.g.
     * `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`.
     */
    outlineBlur: string | number;

    /**
     * @default 0
     * WARNING: This API is experimental and may change.
     * A horizontal offset for the text outline.
     * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
     * which is treated as a percentage of the `fontSize`. Defaults to `0`.
     */
    outlineOffsetX: string | number;

    /**
     * @default 0
     * WARNING: This API is experimental and may change.
     * A vertical offset for the text outline.
     * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
     * which is treated as a percentage of the `fontSize`. Defaults to `0`.
     */
    outlineOffsetY: string | number;

    /**
     * @default 0
     * WARNING: This API is experimental and may change.
     * The width of an inner stroke drawn inside each text glyph using the `strokeColor` and `strokeOpacity`.
     * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
     * which is treated as a percentage of the `fontSize`. Defaults to `0`.
     */
    strokeWidth: string | number;

    /**
     * @default 0x808080
     * WARNING: This API is experimental and may change.
     * The color of the text stroke, if `strokeWidth` is greater than zero. Defaults to gray.
     */
    strokeColor: colorInitializer;

    /**
     * @default 1
     * WARNING: This API is experimental and may change.
     * The opacity of the stroke, if `strokeWidth` is greater than zero. Defaults to `1`.
     */
    strokeOpacity: number;

    /**
     * @deafult 1
     * WARNING: This API is experimental and may change.
     * The opacity of the glyph's fill from 0 to 1. This behaves like the material's `opacity` but allows
     * giving the fill a different opacity than the `strokeOpacity`. A fillOpacity of `0` makes the
     * interior of the glyph invisible, leaving just the `strokeWidth`. Defaults to `1`.
     */
    fillOpacity: number;

    /**
     * @default 0
     * This is a shortcut for setting the material's `polygonOffset` and related properties,
     * which can be useful in preventing z-fighting when this text is laid on top of another
     * plane in the scene. Positive numbers are further from the camera, negatives closer.
     */
    depthOffset: number;

    /**
     * @default null
     * If specified, defines a `[minX, minY, maxX, maxY]` of a rectangle outside of which all
     * pixels will be discarded. This can be used for example to clip overflowing text when
     * `whiteSpace='nowrap'`.
     */
    clipRect: number[] | null;

    /**
     * @default '+x+y'
     * Defines the axis plane on which the text should be laid out when the mesh has no extra
     * rotation transform. It is specified as a string with two axes: the horizontal axis with
     * positive pointing right, and the vertical axis with positive pointing up. By default this
     * is '+x+y', meaning the text sits on the xy plane with the text's top toward positive y
     * and facing positive z. A value of '+x-z' would place it on the xz plane with the text's
     * top toward negative z and facing positive y.
     */
    orientation: string;

    /**
     * @default 1
     * Controls number of vertical/horizontal segments that make up each glyph's rectangular
     * plane. Defaults to 1. This can be increased to provide more geometrical detail for custom
     * vertex shader effects, for example.
     */
    glyphGeometryDetail: number;

    /**
     * @default null 
     * The size of each glyph's SDF (signed distance field) used for rendering. This must be a
     * power-of-two number. Defaults to 64 which is generally a good balance of size and quality
     * for most fonts. Larger sizes can improve the quality of glyph rendering by increasing
     * the sharpness of corners and preventing loss of very thin lines, at the expense of
     * increased memory footprint and longer SDF generation time.
     */
    sdfGlyphSize: number | null;

    /**
     * Updates the text rendering according to the current text-related configuration properties.
     * This is an async process, so you can pass in a callback function to be executed when it
     * finishes.
     * @param {function} [callback]
     */
    sync: (callback?: () => void) => void;

    /**
     * Shortcut to dispose the geometry specific to this instance.
     * Note: we don't also dispose the derived material here because if anything else is
     * sharing the same base material it will result in a pause next frame as the program
     * is recompiled. Instead users can dispose the base material manually, like normal,
     * and we'll also dispose the derived material at that time.
     */
    dispose: () => void;

    /**
     * @readonly
     * The current processed rendering data for this TextMesh, returned by the TextBuilder after
     * a `sync()` call. This will be `null` initially, and may be stale for a short period until
     * the asynchrous `sync()` process completes.
     */
    readonly textRenderInfo: TroikaTextRenderInfo | null

    /**
     * Translate a point in local space to an x/y in the text plane.
     */
    localPositionToTextCoords: (position: Vector2, target?: Vector2) => Vector2

    /**
     * Translate a point in world space to an x/y in the text plane.
     */
    worldPositionToTextCoords: (position: Vector3, target?: Vector2) => Vector2
  }
}
import { Color, Object3D, Vector3, Euler, Quaternion } from 'three'
import { Text, colorInitializer } from 'troika-three-text'
import { VueConstructor } from 'vue'
import { VglMesh } from 'vue-gl'
import Vue from 'vue'

function nullableParser<TIn, TOut>(parser: (a: TIn) => TOut): (a: TIn | null) => TOut | null {
  return (value) => value == null ? null : parser(value)
}

function nullableValidator<T>(validator: (a: T) => boolean): (a: T | null) => boolean {
  return (value) => value == null ? true : validator(value)
}

function validateFloatArray(array: string | (string | number)[]): boolean {
  return (Array.isArray(array)
    ? array
    : array.split(',')).every(value => !Number.isNaN(parseFloat(value as string)))
}

function validateColor(color: string | number | Color | (string | number)[]): boolean {
  return (<Color>color).isColor ||
    typeof color === 'number' ||
    typeof color === 'string'
}

function parseFloatArray(array: string | (string | number)[]): number[] {
  return Array.isArray(array)
    ? array.map(item => typeof item === 'number' ? item : parseFloat(item))
    : array.split(',').map(parseFloat)
}

interface VglObject3dComputed {
  readonly inst: Object3D
  readonly vglObject3d: {
    listen: (callback: () => void) => void
    unlisten: (callback: () => void) => void
    emit(): void
  }
}

interface VglObject3dProps {
  /** The object's local position as a 3D vector. */
  position: Vector3
  /** The object's local rotation as a euler angle. */
  rotation: Euler
  /**
   * The object's local rotation as a quaternion (specified in x, y, z, w order).
   * Do not use in conjunction with the rotation prop, since they both control the same property
   * of the underlying THREE.Object3D object.
   */
  rotationQuaternion: Quaternion
  /** The object's local scale as a 3D vector. */
  scale: Vector3
  /** Whether the object gets rendered into shadow map. */
  castShadow: boolean
  /** Whether the material receives shadows. */
  receiveShadow: boolean
  /** Optional name of the object. */
  name: string
  /** Whether the object is visible. */
  hidden: boolean
}

type VglObject3dType = VglObject3dComputed & VglObject3dProps & Vue

interface VglMeshProps {
  /** Name of the geometry, defining the object's structure. */
  geometry: string | string[]

  /**
   * A Material name or an array of Material name, defining the object's appearance.
   *
   * A single material will apply the material to all object's faces meanwhile
   * an array of material will apply each material to the matching index object's face
   */
  material: string | string[]
}

type VglMeshType = VglMeshProps & VglObject3dType

interface TroikaTextProps {
  /**
   * @default 0
   * The string of text to be rendered.
   * */
  text: string

  /**
   * @default 0
   * Defines the horizontal position in the text block that should line up with the local origin.
   * Can be specified as a numeric x position in local units, a string percentage of the total
   * text block width e.g. `'25%'`, or one of the following keyword strings: 'left', 'center',
   * or 'right'.
   */
  anchorX: string | number

  /**
   * @default 0
   * Defines the vertical position in the text block that should line up with the local origin.
   * Can be specified as a numeric y position in local units (note: down is negative y), a string
   * percentage of the total text block height e.g. `'25%'`, or one of the following keyword strings:
   * 'top', 'top-baseline', 'middle', 'bottom-baseline', or 'bottom'.
   */
  anchorY: string | number

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
  curveRadius: number

  /**
   * @default 'auto'
   * Sets the base direction for the text. The default value of "auto" will choose a direction based
   * on the text's content according to the bidi spec. A value of "ltr" or "rtl" will force the direction.
   */
  direction: string

  /**
   * @default null
   * URL of a custom font to be used. Font files can be any of the formats supported by
   * OpenType (see https://github.com/opentypejs/opentype.js).
   * Defaults to the Roboto font loaded from Google Fonts.
   */
  font: string | null

  /**
   * @default 0.1
   * The size at which to render the font in local units; corresponds to the em-box height
   * of the chosen `font`.
   */
  fontSize: number

  /**
   * @default 0
   * Sets a uniform adjustment to spacing between letters after kerning is applied. Positive
   * numbers increase spacing and negative numbers decrease it.
   */
  letterSpacing: number

  /**
   * @default 'normal'
   * Sets the height of each line of text, as a multiple of the `fontSize`. Defaults to 'normal',
   * which chooses a reasonable height based on the chosen font's ascender/descender metrics.
   */
  lineHeight: string | number

  /**
   * @default Infinity
   * The maximum width of the text block, above which text may start wrapping according to the
   * `whiteSpace` and `overflowWrap` properties.
   */
  maxWidth: number

  /**
   * @default 'normal'
   * Defines how text wraps if the `whiteSpace` property is `normal`. Can be either `'normal'`
   * to break at whitespace characters, or `'break-word'` to allow breaking within words.
   */
  overflowWrap: string

  /**
   * @default 'left'
   * The horizontal alignment of each line of text within the overall text bounding box.
   */
  textAlign: string

  /**
   * @default 0
   * Indentation for the first character of a line; see CSS `text-indent`.
   */
  textIndent: number

  /**
   * @default 'normal'
   * Defines whether text should wrap when a line reaches the `maxWidth`. Can
   * be either `'normal'` (the default), to allow wrapping according to the `overflowWrap` property,
   * or `'nowrap'` to prevent wrapping. Note that `'normal'` here honors newline characters to
   * manually break lines, making it behave more like `'pre-wrap'` does in CSS.
   */
  whiteSpace: string

  /**
   * @default null
   * This is a shortcut for setting the `color` of the text's material. You can use this
   * if you don't want to specify a whole custom `material`. Also, if you do use a custom
   * `material`, this color will only be used for this particuar Text instance, even if
   * that same material instance is shared across multiple Text objects.
   */
  color: colorInitializer | null

  /**
   * @default null
   * WARNING: This API is experimental and may change.
   * This allows more fine-grained control of colors for individual or ranges of characters,
   * taking precedence over the material's `color`. Its format is an Object whose keys each
   * define a starting character index for a range, and whose values are the color for each
   * range. The color value can be a numeric hex color value, a `THREE.Color` object, or
   * any of the strings accepted by `THREE.Color`.
   */
  colorRanges: { [index: number]: colorInitializer } | null

  /**
   * @default 0
   * WARNING: This API is experimental and may change.
   * The width of an outline/halo to be drawn around each text glyph using the `outlineColor` and `outlineOpacity`.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g.
   * `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`, which means
   * no outline will be drawn unless an `outlineOffsetX/Y` or `outlineBlur` is set.
   */
  outlineWidth: string | number

  /**
   * @default 0x000000
   * WARNING: This API is experimental and may change.
   * The color of the text outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
   */
  outlineColor: colorInitializer

  /**
   * @default 1
   * WARNING: This API is experimental and may change.
   * The opacity of the outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
   */
  outlineOpacity: number

  /**
   * @default 0
   * WARNING: This API is experimental and may change.
   * A blur radius applied to the outer edge of the text's outline. If the `outlineWidth` is
   * zero, the blur will be applied at the glyph edge, like CSS's `text-shadow` blur radius.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g.
   * `"12%"` which is treated as a percentage of the `fontSize`.
   */
  outlineBlur: string | number

  /**
   * @default 0
   * WARNING: This API is experimental and may change.
   * A horizontal offset for the text outline.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
   * which is treated as a percentage of the `fontSize`.
   */
  outlineOffsetX: string | number

  /**
   * @default 0
   * WARNING: This API is experimental and may change.
   * A vertical offset for the text outline.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
   * which is treated as a percentage of the `fontSize`.
   */
  outlineOffsetY: string | number

  /**
   * @default 0
   * WARNING: This API is experimental and may change.
   * The width of an inner stroke drawn inside each text glyph using the `strokeColor` and `strokeOpacity`.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
   * which is treated as a percentage of the `fontSize`.
   */
  strokeWidth: string | number

  /**
   * @default 0x808080
   * WARNING: This API is experimental and may change.
   * The color of the text stroke, if `strokeWidth` is greater than zero.
   */
  strokeColor: colorInitializer

  /**
   * @default 1
   * WARNING: This API is experimental and may change.
   * The opacity of the stroke, if `strokeWidth` is greater than zero.
   */
  strokeOpacity: number

  /**
   * @deafult 1
   * WARNING: This API is experimental and may change.
   * The opacity of the glyph's fill from 0 to 1. This behaves like the material's `opacity` but allows
   * giving the fill a different opacity than the `strokeOpacity`. A fillOpacity of `0` makes the
   * interior of the glyph invisible, leaving just the `strokeWidth`.
   */
  fillOpacity: number

  /**
   * @default 0
   * This is a shortcut for setting the material's `polygonOffset` and related properties,
   * which can be useful in preventing z-fighting when this text is laid on top of another
   * plane in the scene. Positive numbers are further from the camera, negatives closer.
   */
  depthOffset: number

  /**
   * @default null
   * If specified, defines a `[minX, minY, maxX, maxY]` of a rectangle outside of which all
   * pixels will be discarded. This can be used for example to clip overflowing text when
   * `whiteSpace='nowrap'`.
   */
  clipRect: number[] | null

  /**
   * @default '+x+y'
   * Defines the axis plane on which the text should be laid out when the mesh has no extra
   * rotation transform. It is specified as a string with two axes: the horizontal axis with
   * positive pointing right, and the vertical axis with positive pointing up. By default this
   * is '+x+y', meaning the text sits on the xy plane with the text's top toward positive y
   * and facing positive z. A value of '+x-z' would place it on the xz plane with the text's
   * top toward negative z and facing positive y.
   */
  orientation: string

  /**
   * @default 1
   * Controls number of vertical/horizontal segments that make up each glyph's rectangular
   * plane. Defaults to 1. This can be increased to provide more geometrical detail for custom
   * vertex shader effects, for example.
   */
  glyphGeometryDetail: number

  /**
   * @default null
   * The size of each glyph's SDF (signed distance field) used for rendering. This must be a
   * power-of-two number. Defaults to 64 which is generally a good balance of size and quality
   * for most fonts. Larger sizes can improve the quality of glyph rendering by increasing
   * the sharpness of corners and preventing loss of very thin lines, at the expense of
   * increased memory footprint and longer SDF generation time.
   */
  sdfGlyphSize: number | null
}

interface TroikaTextComputed {
  get inst(): Text
}

type TroikaTextType =
  TroikaTextComputed &
  TroikaTextProps &
  VglMeshType

const TroikaText = (Vue.extend(VglMesh) as VueConstructor<VglMeshType>).extend<null, null, TroikaTextComputed, TroikaTextProps>({
  mixins: [VglMesh],

  props: {
    text: { type: String, default: '' },
    anchorX: { type: [String, Number], default: 0 },
    anchorY: { type: [String, Number], default: 0 },
    curveRadius: { type: Number, default: 0 },
    direction: { type: String, default: 'auto' },
    font: { type: String, default: null },
    fontSize: { type: Number, default: 0.1 },
    letterSpacing: { type: Number, default: 0 },
    lineHeight: { type: [String, Number], default: 'normal' },
    maxWidth: { type: Number, default: Infinity },
    overflowWrap: { type: String, default: 'normal' },
    textAlign: { type: String, default: 'left' },
    textIndent: { type: Number, default: 0 },
    whiteSpace: { type: String, default: 'normal' },
    color: { type: [String, Color, Number], default: null, validator: nullableValidator(validateColor) },
    colorRanges: { type: Array, default: null },
    outlineWidth: { type: [String, Number], default: 0 },
    outlineColor: { type: [String, Color, Number], default: 0, validator: nullableValidator(validateColor) },
    outlineOpacity: { type: Number, default: 1 },
    outlineBlur: { type: [String, Number], default: 0 },
    outlineOffsetY: { type: [String, Number], default: 0 },
    outlineOffsetX: { type: [String, Number], default: 0 },
    strokeWidth: { type: [String, Number], default: 0 },
    strokeColor: { type: [String, Color, Number], default: 0x808080, validator: nullableValidator(validateColor) },
    strokeOpacity: { type: Number, default: 1 },
    fillOpacity: { type: Number, default: 1 },
    depthOffset: { type: Number, default: 0 },
    clipRect: { type: Array, default: null, validator: nullableValidator(validateFloatArray) },
    orientation: { type: String, default: '+x+y' },
    glyphGeometryDetail: { type: Number, default: 1 },
    sdfGlyphSize: { type: Number, default: null }
  },

  computed: {
    inst(this: TroikaTextType): Text {
      const mesh = new Text()
      mesh.addEventListener('synccomplete', () => {
        this.vglObject3d.emit()
      })
      return mesh
    }
  },

  watch: {
    text(this: TroikaTextType, text: TroikaTextProps['text']): void {
      this.inst.text = text
      this.inst.sync()
    },
    anchorX(this: TroikaTextType, anchorX: TroikaTextProps['anchorX']): void {
      this.inst.anchorX = anchorX
      this.inst.sync()
    },
    anchorY(this: TroikaTextType, anchorY: TroikaTextProps['anchorY']): void {
      this.inst.anchorY = anchorY
      this.inst.sync()
    },
    curveRadius(this: TroikaTextType, curveRadius: TroikaTextProps['curveRadius']): void {
      this.inst.curveRadius = curveRadius
      this.vglObject3d.emit()
    },
    direction(this: TroikaTextType, direction: TroikaTextProps['direction']): void {
      this.inst.direction = direction
      this.inst.sync()
    },
    font(this: TroikaTextType, font: TroikaTextProps['font']): void {
      this.inst.font = font
      this.inst.sync()
    },
    fontSize(this: TroikaTextType, fontSize: TroikaTextProps['fontSize']): void {
      this.inst.fontSize = fontSize
      this.inst.sync()
    },
    letterSpacing(this: TroikaTextType, letterSpacing: TroikaTextProps['letterSpacing']): void {
      this.inst.letterSpacing = letterSpacing
      this.inst.sync()
    },
    lineHeight(this: TroikaTextType, lineHeight: TroikaTextProps['lineHeight']): void {
      this.inst.lineHeight = lineHeight
      this.inst.sync()
    },
    maxWidth(this: TroikaTextType, maxWidth: TroikaTextProps['maxWidth']): void {
      this.inst.maxWidth = maxWidth
      this.inst.sync()
    },
    overflowWrap(this: TroikaTextType, overflowWrap: TroikaTextProps['overflowWrap']): void {
      this.inst.overflowWrap = overflowWrap
      this.inst.sync()
    },
    textAlign(this: TroikaTextType, textAlign: TroikaTextProps['textAlign']): void {
      this.inst.textAlign = textAlign
      this.inst.sync()
    },
    textIndent(this: TroikaTextType, textIndent: TroikaTextProps['textIndent']): void {
      this.inst.textIndent = textIndent
      this.inst.sync()
    },
    whiteSpace(this: TroikaTextType, whiteSpace: TroikaTextProps['whiteSpace']): void {
      this.inst.whiteSpace = whiteSpace
      this.inst.sync()
    },
    color(this: TroikaTextType, color: TroikaTextProps['color']): void {
      this.inst.color = color
      this.vglObject3d.emit()
    },
    colorRanges(this: TroikaTextType, colorRanges: TroikaTextProps['colorRanges']): void {
      this.inst.colorRanges = colorRanges
      this.inst.sync()
    },
    outlineWidth(this: TroikaTextType, outlineWidth: TroikaTextProps['outlineWidth']): void {
      this.inst.outlineWidth = outlineWidth
      this.vglObject3d.emit()
    },
    outlineColor(this: TroikaTextType, outlineColor: TroikaTextProps['outlineColor']): void {
      this.inst.outlineColor = outlineColor
      this.vglObject3d.emit()
    },
    outlineOpacity(this: TroikaTextType, outlineOpacity: TroikaTextProps['outlineOpacity']): void {
      this.inst.outlineOpacity = outlineOpacity
      this.vglObject3d.emit()
    },
    outlineBlur(this: TroikaTextType, outlineBlur: TroikaTextProps['outlineBlur']): void {
      this.inst.outlineBlur = outlineBlur
      this.vglObject3d.emit()
    },
    outlineOffsetX(this: TroikaTextType, outlineOffsetX: TroikaTextProps['outlineOffsetX']): void {
      this.inst.outlineOffsetX = outlineOffsetX
      this.vglObject3d.emit()
    },
    outlineOffsetY(this: TroikaTextType, outlineOffsetY: TroikaTextProps['outlineOffsetY']): void {
      this.inst.outlineOffsetY = outlineOffsetY
      this.vglObject3d.emit()
    },
    strokeWidth(this: TroikaTextType, strokeWidth: TroikaTextProps['strokeWidth']): void {
      this.inst.strokeWidth = strokeWidth
      this.vglObject3d.emit()
    },
    strokeColor(this: TroikaTextType, strokeColor: TroikaTextProps['strokeColor']): void {
      this.inst.strokeColor = strokeColor
      this.vglObject3d.emit()
    },
    strokeOpacity(this: TroikaTextType, strokeOpacity: TroikaTextProps['strokeOpacity']): void {
      this.inst.strokeOpacity = strokeOpacity
      this.vglObject3d.emit()
    },
    fillOpacity(this: TroikaTextType, fillOpacity: TroikaTextProps['fillOpacity']): void {
      this.inst.fillOpacity = fillOpacity
      this.vglObject3d.emit()
    },
    depthOffset(this: TroikaTextType, depthOffset: TroikaTextProps['depthOffset']): void {
      this.inst.depthOffset = depthOffset
      this.vglObject3d.emit()
    },
    clipRect(this: TroikaTextType, clipRect: TroikaTextProps['clipRect']): void {
      this.inst.clipRect = nullableParser(parseFloatArray)(clipRect)
      this.vglObject3d.emit()
    },
    orientation(this: TroikaTextType, orientation: TroikaTextProps['orientation']): void {
      this.inst.orientation = orientation
      this.vglObject3d.emit()
    },
    glyphGeometryDetail(this: TroikaTextType, glyphGeometryDetail: TroikaTextProps['glyphGeometryDetail']): void {
      this.inst.glyphGeometryDetail = glyphGeometryDetail
      this.vglObject3d.emit()
    },
    sdfGlyphSize(this: TroikaTextType, sdfGlyphSize: TroikaTextProps['sdfGlyphSize']): void {
      this.inst.sdfGlyphSize = sdfGlyphSize
      this.inst.sync()
    },

    inst: {
      immediate: true,
      handler(this: TroikaTextType, inst: Text): void {
        inst.text = this.text
        inst.anchorX = this.anchorX
        inst.anchorY = this.anchorY
        inst.curveRadius = this.curveRadius
        inst.direction = this.direction
        inst.font = this.font
        inst.fontSize = this.fontSize
        inst.letterSpacing = this.letterSpacing
        inst.lineHeight = this.lineHeight
        inst.maxWidth = this.maxWidth
        inst.overflowWrap = this.overflowWrap
        inst.textAlign = this.textAlign
        inst.textIndent = this.textIndent
        inst.whiteSpace = this.whiteSpace
        inst.color = this.color
        inst.colorRanges = this.colorRanges
        inst.outlineWidth = this.outlineWidth
        inst.outlineColor = this.outlineColor
        inst.outlineOpacity = this.outlineOpacity
        inst.outlineBlur = this.outlineBlur
        inst.outlineOffsetX = this.outlineOffsetX
        inst.outlineOffsetY = this.outlineOffsetY
        inst.strokeWidth = this.strokeWidth
        inst.strokeColor = this.strokeColor
        inst.strokeOpacity = this.strokeOpacity
        inst.fillOpacity = this.fillOpacity
        inst.depthOffset = this.depthOffset
        inst.clipRect = nullableParser(parseFloatArray)(this.clipRect)
        inst.orientation = this.orientation
        inst.glyphGeometryDetail = this.glyphGeometryDetail
        inst.sdfGlyphSize = this.sdfGlyphSize
        inst.sync()
      }
    }
  },

  destroyed(this: TroikaTextComputed): void {
    if (this.inst !== undefined) {
      this.inst.dispose()
    }
  }
}) as VueConstructor<TroikaTextType>

export default TroikaText

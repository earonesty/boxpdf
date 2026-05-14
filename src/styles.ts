/**
 * Identity function that returns the styles object as-is, but preserves its
 * literal type so consumers get autocomplete + a single place to point to in
 * docs. No runtime cost.
 *
 * @example
 *   const styles = defineStyles({
 *     card: { padding: 16, background: hex("#fafafa"), borderRadius: 8 },
 *     h1: { size: 22, font: bold },
 *     muted: { size: 10, font, color: hex("#6b7280") }
 *   });
 *
 *   vstack(styles.card,
 *     text("Hello", styles.h1),
 *     text("World", styles.muted)
 *   );
 */
export function defineStyles<T extends Record<string, object>>(styles: T): T {
  return styles;
}

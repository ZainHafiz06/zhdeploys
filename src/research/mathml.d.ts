/**
 * MathML Core elements, rendered natively by current browsers. React passes
 * them through untouched; its types just don't list them yet.
 */
import "react";

type MathProps = React.HTMLAttributes<HTMLElement> & {
  display?: "block" | "inline";
  mathvariant?: string;
  accent?: "true" | "false";
  stretchy?: "true" | "false";
  width?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      math: MathProps;
      mi: MathProps;
      mn: MathProps;
      mo: MathProps;
      mtext: MathProps;
      mrow: MathProps;
      msub: MathProps;
      msup: MathProps;
      mfrac: MathProps;
      mover: MathProps;
      munderover: MathProps;
      mspace: MathProps;
    }
  }
}

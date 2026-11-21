/**
 * Fig. 1: the real route a page view and a contact message take through the
 * infrastructure in `infra/app`. Signals travel along the wires with SMIL
 * `animateMotion`, so it animates without any JavaScript (and is hidden when
 * the visitor prefers reduced motion, see `.signal` in app.css).
 */

type Node = {
  id: string;
  title: string;
  note: string;
  x: number;
  y: number;
  here?: boolean;
};

type Edge = {
  d: string;
  label?: string;
  lx?: number;
  ly?: number;
  /** The contact branch is drawn dashed. */
  dashed?: boolean;
};

type Layout = {
  width: number;
  height: number;
  boxW: number;
  boxH: number;
  nodes: Node[];
  edges: Edge[];
  /** Paths the signals travel, drawn underneath the boxes. */
  routes: { d: string; dur: string; begin: string; reverse?: boolean }[];
};

const NODES = {
  you: { title: "You", note: "a browser, somewhere" },
  dns: { title: "Route 53", note: "rohinchopra.com" },
  cdn: { title: "CloudFront", note: "edge · cache" },
  s3: { title: "S3", note: "prerendered html" },
  api: { title: "API Gateway", note: "key + rate limit" },
  fn: { title: "Lambda", note: "go · arm64" },
  ses: { title: "SES", note: "→ my inbox" },
} as const;

const node = (
  id: keyof typeof NODES,
  x: number,
  y: number,
  here = false,
): Node => ({ id, ...NODES[id], x, y, here });

const WIDE: Layout = {
  width: 1000,
  height: 270,
  boxW: 160,
  boxH: 58,
  nodes: [
    node("you", 100, 80, true),
    node("dns", 360, 80),
    node("cdn", 620, 80),
    node("s3", 880, 80),
    node("api", 360, 210),
    node("fn", 620, 210),
    node("ses", 880, 210),
  ],
  edges: [
    { d: "M180 80 H280", label: "resolve", lx: 230, ly: 70 },
    { d: "M440 80 H540", label: "alias", lx: 490, ly: 70 },
    { d: "M700 80 H800", label: "oac", lx: 750, ly: 70 },
    {
      d: "M100 109 V210 H280",
      label: "post /contact",
      lx: 190,
      ly: 200,
      dashed: true,
    },
    { d: "M440 210 H540", label: "invoke", lx: 490, ly: 200 },
    { d: "M700 210 H800", label: "send", lx: 750, ly: 200 },
  ],
  routes: [
    { d: "M180 80 H800", dur: "2.6s", begin: "0s" },
    { d: "M180 80 H800", dur: "2.6s", begin: "1.3s", reverse: true },
    { d: "M100 109 V210 H800", dur: "3.4s", begin: "0.6s" },
  ],
};

const NARROW: Layout = {
  width: 360,
  height: 470,
  boxW: 150,
  boxH: 56,
  nodes: [
    node("you", 180, 40, true),
    node("dns", 95, 175),
    node("cdn", 95, 300),
    node("s3", 95, 425),
    node("api", 265, 175),
    node("fn", 265, 300),
    node("ses", 265, 425),
  ],
  edges: [
    { d: "M150 68 V105 H95 V147" },
    {
      d: "M210 68 V105 H265 V147",
      label: "post",
      lx: 272,
      ly: 132,
      dashed: true,
    },
    { d: "M95 203 V272", label: "alias", lx: 102, ly: 242 },
    { d: "M95 328 V397", label: "oac", lx: 102, ly: 367 },
    { d: "M265 203 V272", label: "invoke", lx: 272, ly: 242 },
    { d: "M265 328 V397", label: "send", lx: 272, ly: 367 },
  ],
  routes: [
    { d: "M150 68 V105 H95 V397", dur: "2.8s", begin: "0s" },
    { d: "M210 68 V105 H265 V397", dur: "3.4s", begin: "0.9s" },
  ],
};

const Diagram = ({
  layout,
  idPrefix,
  className,
}: {
  layout: Layout;
  idPrefix: string;
  className: string;
}) => {
  const { width, height, boxW, boxH, nodes, edges, routes } = layout;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-labelledby={`${idPrefix}-title`}
    >
      <title id={`${idPrefix}-title`}>
        A page request travels from your browser through Route 53 and CloudFront
        to S3. The contact form posts through API Gateway to a Go Lambda
        function, which forwards it to me with SES.
      </title>

      {routes.map((route, i) => (
        <path key={i} id={`${idPrefix}-route-${i}`} d={route.d} fill="none" />
      ))}

      <g className="fill-none stroke-ink" strokeWidth={1.1}>
        {edges.map((edge, i) => (
          <path
            key={i}
            d={edge.d}
            strokeDasharray={edge.dashed ? "4 4" : undefined}
          />
        ))}
      </g>

      <g className="fill-muted font-mono" fontSize={layout === WIDE ? 10 : 9.5}>
        {edges.map(
          (edge, i) =>
            edge.label && (
              <text
                key={i}
                x={edge.lx}
                y={edge.ly}
                textAnchor={layout === WIDE ? "middle" : "start"}
                letterSpacing="0.08em"
              >
                {edge.label.toUpperCase()}
              </text>
            ),
        )}
      </g>

      {routes.map((route, i) => (
        <circle
          key={i}
          r={4}
          className={`signal ${route.reverse ? "fill-ink" : "fill-accent"}`}
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.08;0.9;1"
            dur={route.dur}
            begin={route.begin}
            repeatCount="indefinite"
          />
          <animateMotion
            dur={route.dur}
            begin={route.begin}
            repeatCount="indefinite"
            calcMode="spline"
            keyTimes="0;1"
            keySplines="0.45 0 0.55 1"
            keyPoints={route.reverse ? "1;0" : "0;1"}
          >
            <mpath href={`#${idPrefix}-route-${i}`} />
          </animateMotion>
        </circle>
      ))}

      {nodes.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x - boxW / 2}
            y={n.y - boxH / 2}
            width={boxW}
            height={boxH}
            className={n.here ? "fill-ink" : "fill-paper stroke-ink"}
            strokeWidth={1.1}
          />
          <text
            x={n.x}
            y={n.y - 2}
            textAnchor="middle"
            className={`font-sans ${n.here ? "fill-paper" : "fill-ink"}`}
            fontSize={16}
            fontWeight={600}
          >
            {n.title}
          </text>
          <text
            x={n.x}
            y={n.y + 15}
            textAnchor="middle"
            className={`font-mono ${n.here ? "fill-paper/70" : "fill-muted"}`}
            fontSize={9.5}
            letterSpacing="0.06em"
          >
            {n.note.toUpperCase()}
          </text>
          {n.here && (
            <text
              x={n.x - boxW / 2}
              y={n.y - boxH / 2 - 8}
              className="fill-accent font-mono"
              fontSize={10}
              letterSpacing="0.1em"
            >
              ● YOU ARE HERE
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

export const ArchitectureFigure = () => (
  <figure>
    <div className="plate border border-line bg-surface/60 px-4 py-8 sm:px-8 sm:py-10">
      <Diagram
        layout={WIDE}
        idPrefix="arch-wide"
        className="hidden h-auto w-full overflow-visible md:block"
      />
      <Diagram
        layout={NARROW}
        idPrefix="arch-narrow"
        className="mx-auto block h-auto w-full max-w-sm overflow-visible md:hidden"
      />
    </div>
    <figcaption className="mt-4 flex flex-col gap-1 text-sm text-muted sm:flex-row sm:gap-6">
      <span className="label shrink-0 pt-0.5 text-ink">Fig. 1</span>
      <span className="max-w-2xl">
        The route this page took to reach you, and the one your message takes to
        reach me. Every box is real, and all of it is defined in Pulumi in this
        site&apos;s repo.
      </span>
    </figcaption>
  </figure>
);

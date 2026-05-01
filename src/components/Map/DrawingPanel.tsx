import {
  Circle,
  Eraser,
  Eye,
  EyeOff,
  MousePointer2,
  Pentagon,
  PenLine,
  Redo2,
  Route,
  Save,
  SlidersHorizontal,
  Trash2,
  Undo2,
} from "lucide-react";
import { useReducer, type SyntheticEvent } from "react";
import type { LucideIcon } from "lucide-react";

type DrawingToolId = "select" | "point" | "line" | "area" | "freehand" | "erase";

type DrawingTool = {
  id: DrawingToolId;
  label: string;
  icon: LucideIcon;
};

type DrawingSettings = {
  selectedTool: DrawingToolId;
  strokeColor: string;
  strokeWidth: number;
  isVisible: boolean;
};

type DrawingPanelState = {
  past: DrawingSettings[];
  present: DrawingSettings;
  future: DrawingSettings[];
  isDirty: boolean;
  isStylePanelOpen: boolean;
};

type DrawingPanelAction =
  | { type: "selectTool"; tool: DrawingToolId }
  | { type: "selectStrokeColor"; color: string }
  | { type: "setStrokeWidth"; width: number }
  | { type: "toggleVisibility" }
  | { type: "toggleStylePanel" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "save" }
  | { type: "clear" };

const drawingTools: DrawingTool[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "point", label: "Point", icon: Circle },
  { id: "line", label: "Line", icon: Route },
  { id: "area", label: "Area", icon: Pentagon },
  { id: "freehand", label: "Freehand", icon: PenLine },
  { id: "erase", label: "Erase", icon: Eraser },
];

const strokeColors = ["#38bdf8", "#22c55e", "#f97316", "#f43f5e"];
const strokeWidthRange = { min: 1, max: 8 };

const defaultSettings: DrawingSettings = {
  selectedTool: "select",
  strokeColor: strokeColors[0],
  strokeWidth: 2,
  isVisible: true,
};

const initialState: DrawingPanelState = {
  past: [],
  present: defaultSettings,
  future: [],
  isDirty: false,
  isStylePanelOpen: true,
};

const drawingPanelReducer = (
  state: DrawingPanelState,
  action: DrawingPanelAction,
): DrawingPanelState => {
  switch (action.type) {
    case "selectTool":
      return commitSettings(state, { selectedTool: action.tool });
    case "selectStrokeColor":
      return commitSettings(state, { strokeColor: action.color });
    case "setStrokeWidth":
      return commitSettings(state, { strokeWidth: action.width });
    case "toggleVisibility":
      return commitSettings(state, { isVisible: !state.present.isVisible });
    case "toggleStylePanel":
      return { ...state, isStylePanelOpen: !state.isStylePanelOpen };
    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;

      return {
        ...state,
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        isDirty: true,
      };
    }
    case "redo": {
      const [next, ...future] = state.future;
      if (!next) return state;

      return {
        ...state,
        past: [...state.past, state.present],
        present: next,
        future,
        isDirty: true,
      };
    }
    case "save":
      return { ...state, isDirty: false };
    case "clear":
      return {
        ...state,
        past: [state.present],
        present: defaultSettings,
        future: [],
        isDirty: true,
      };
    default:
      return state;
  }
};

const commitSettings = (
  state: DrawingPanelState,
  updates: Partial<DrawingSettings>,
): DrawingPanelState => {
  const nextSettings = { ...state.present, ...updates };

  if (areSettingsEqual(state.present, nextSettings)) {
    return state;
  }

  return {
    ...state,
    past: [...state.past, state.present],
    present: nextSettings,
    future: [],
    isDirty: true,
  };
};

const areSettingsEqual = (
  left: DrawingSettings,
  right: DrawingSettings,
) => {
  return (
    left.selectedTool === right.selectedTool &&
    left.strokeColor === right.strokeColor &&
    left.strokeWidth === right.strokeWidth &&
    left.isVisible === right.isVisible
  );
};

const stopMapEventPropagation = (event: SyntheticEvent) => {
  event.stopPropagation();
};

const DrawingPanel = () => {
  const [state, dispatch] = useReducer(drawingPanelReducer, initialState);
  const { present } = state;
  const activeTool =
    drawingTools.find((tool) => tool.id === present.selectedTool) ??
    drawingTools[0];
  const hasUndo = state.past.length > 0;
  const hasRedo = state.future.length > 0;

  return (
    <section
      className="absolute left-2 top-20 z-400 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-white/20 bg-zinc-950/85 text-white shadow-2xl shadow-black/35 backdrop-blur-xl"
      aria-label="Drawing panel"
      onClickCapture={stopMapEventPropagation}
      onDoubleClickCapture={stopMapEventPropagation}
      onMouseDownCapture={stopMapEventPropagation}
      onMouseUpCapture={stopMapEventPropagation}
      onPointerDownCapture={stopMapEventPropagation}
      onPointerMoveCapture={stopMapEventPropagation}
      onPointerUpCapture={stopMapEventPropagation}
      onTouchStartCapture={stopMapEventPropagation}
      onTouchMoveCapture={stopMapEventPropagation}
      onTouchEndCapture={stopMapEventPropagation}
      onWheelCapture={stopMapEventPropagation}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Drawing</h2>
          <p className="text-xs text-zinc-400">
            {state.isDirty ? "Unsaved draft" : "Draft saved"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            label="Undo"
            icon={Undo2}
            disabled={!hasUndo}
            onClick={() => dispatch({ type: "undo" })}
          />
          <IconButton
            label="Redo"
            icon={Redo2}
            disabled={!hasRedo}
            onClick={() => dispatch({ type: "redo" })}
          />
          <IconButton
            label="Save drawing"
            icon={Save}
            prominent
            disabled={!state.isDirty}
            onClick={() => dispatch({ type: "save" })}
          />
        </div>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-6 gap-1 rounded-md bg-white/5 p-1">
          {drawingTools.map((tool) => (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              aria-pressed={tool.id === present.selectedTool}
              onClick={() => dispatch({ type: "selectTool", tool: tool.id })}
              className={`flex aspect-square items-center justify-center rounded-md border text-sm transition ${
                tool.id === present.selectedTool
                  ? "border-cyan-300/80 bg-cyan-300 text-zinc-950 shadow shadow-cyan-950/40"
                  : "border-transparent text-zinc-300 hover:border-white/15 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tool.icon className="h-4 w-4" strokeWidth={2.2} />
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          <span className="text-xs text-zinc-400">Active tool</span>
          <span className="text-xs font-medium text-white">
            {activeTool.label}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
          <div
            className={`rounded-md border border-white/10 bg-white/[0.04] p-3 transition ${
              state.isStylePanelOpen ? "opacity-100" : "opacity-55"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Stroke</span>
              <span className="text-xs text-zinc-500">
                {present.strokeWidth} px
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {strokeColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  aria-label={`Stroke color ${color}`}
                  aria-pressed={color === present.strokeColor}
                  disabled={!state.isStylePanelOpen}
                  onClick={() =>
                    dispatch({ type: "selectStrokeColor", color })
                  }
                  className={`h-6 w-6 rounded-full border border-white/30 shadow-inner shadow-black/30 ring-2 transition ${
                    color === present.strokeColor
                      ? "ring-cyan-300"
                      : "ring-transparent hover:ring-white/50"
                  } disabled:cursor-not-allowed disabled:opacity-45`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <input
              className="mt-3 h-1.5 w-full accent-cyan-300"
              type="range"
              min={strokeWidthRange.min}
              max={strokeWidthRange.max}
              value={present.strokeWidth}
              disabled={!state.isStylePanelOpen}
              aria-label="Stroke width"
              onChange={(event) =>
                dispatch({
                  type: "setStrokeWidth",
                  width: Number(event.target.value),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <IconButton
              label="Style settings"
              icon={SlidersHorizontal}
              active={state.isStylePanelOpen}
              onClick={() => dispatch({ type: "toggleStylePanel" })}
            />
            <IconButton
              label={
                present.isVisible ? "Hide draft layer" : "Show draft layer"
              }
              icon={present.isVisible ? Eye : EyeOff}
              active={present.isVisible}
              onClick={() => dispatch({ type: "toggleVisibility" })}
            />
            <IconButton
              label="Clear drawing"
              icon={Trash2}
              danger
              onClick={() => dispatch({ type: "clear" })}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

type IconButtonProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  prominent?: boolean;
  danger?: boolean;
  active?: boolean;
  disabled?: boolean;
};

const IconButton = ({
  label,
  icon: Icon,
  onClick,
  prominent = false,
  danger = false,
  active = false,
  disabled = false,
}: IconButtonProps) => {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        prominent
          ? "border-cyan-300/80 bg-cyan-300 text-zinc-950 hover:bg-cyan-200"
          : danger
            ? "border-red-300/25 bg-red-500/10 text-red-200 hover:bg-red-500/20"
            : active
              ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100"
              : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
};

export default DrawingPanel;

import type { KeyboardEvent, MouseEvent, PropsWithChildren } from "react";

const stopEventPropagation = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
  event.stopPropagation();
};

export function MouseAndKeyboardPropagationBlocker({children}: PropsWithChildren){
    return <div
        onClick={stopEventPropagation}
        onContextMenu={stopEventPropagation}
        onDoubleClick={stopEventPropagation}
        onKeyDown={stopEventPropagation}
        onKeyUp={stopEventPropagation}
        onMouseDown={stopEventPropagation}
        onMouseMove={stopEventPropagation}
        onMouseUp={stopEventPropagation}
    >{children}</div>;
}
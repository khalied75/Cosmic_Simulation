export function lockSceneInteraction(container, interactiveElement) {
  const html = document.documentElement;
  const body = document.body;
  const previousHtmlOverscroll = html.style.overscrollBehavior;
  const previousHtmlTouchAction = html.style.touchAction;
  const previousHtmlUserSelect = html.style.userSelect;
  const previousBodyOverflow = body.style.overflow;
  const previousBodyOverscroll = body.style.overscrollBehavior;
  const previousBodyTouchAction = body.style.touchAction;
  const previousBodyUserSelect = body.style.userSelect;
  const previousContainerTouchAction = container.style.touchAction;
  const previousContainerOverscroll = container.style.overscrollBehavior;
  const previousContainerOverflow = container.style.overflow;
  const previousElementTouchAction = interactiveElement.style.touchAction;
  const previousElementUserSelect = interactiveElement.style.userSelect;

  html.style.overscrollBehavior = "none";
  html.style.touchAction = "none";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  body.style.touchAction = "none";
  container.style.touchAction = "none";
  container.style.overscrollBehavior = "none";
  container.style.overflow = "hidden";
  interactiveElement.style.touchAction = "none";
  interactiveElement.style.userSelect = "none";

  const preventTouchScroll = (event) => {
    event.preventDefault();
  };
  const releasePointerState = (event) => {
    if (event?.pointerId != null && interactiveElement.hasPointerCapture?.(event.pointerId)) {
      interactiveElement.releasePointerCapture(event.pointerId);
    }
    html.style.userSelect = previousHtmlUserSelect;
    body.style.userSelect = previousBodyUserSelect;
  };
  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    interactiveElement.setPointerCapture?.(event.pointerId);
    html.style.userSelect = "none";
    body.style.userSelect = "none";
    event.preventDefault();
  };
  const handleDragStart = (event) => {
    event.preventDefault();
  };

  container.addEventListener("touchstart", preventTouchScroll, { passive: false });
  container.addEventListener("touchmove", preventTouchScroll, { passive: false });
  interactiveElement.addEventListener("touchstart", preventTouchScroll, { passive: false });
  interactiveElement.addEventListener("touchmove", preventTouchScroll, { passive: false });
  interactiveElement.addEventListener("pointerdown", handlePointerDown);
  interactiveElement.addEventListener("pointerup", releasePointerState);
  interactiveElement.addEventListener("pointercancel", releasePointerState);
  interactiveElement.addEventListener("lostpointercapture", releasePointerState);
  interactiveElement.addEventListener("dragstart", handleDragStart);

  return () => {
    container.removeEventListener("touchstart", preventTouchScroll);
    container.removeEventListener("touchmove", preventTouchScroll);
    interactiveElement.removeEventListener("touchstart", preventTouchScroll);
    interactiveElement.removeEventListener("touchmove", preventTouchScroll);
    interactiveElement.removeEventListener("pointerdown", handlePointerDown);
    interactiveElement.removeEventListener("pointerup", releasePointerState);
    interactiveElement.removeEventListener("pointercancel", releasePointerState);
    interactiveElement.removeEventListener("lostpointercapture", releasePointerState);
    interactiveElement.removeEventListener("dragstart", handleDragStart);
    html.style.overscrollBehavior = previousHtmlOverscroll;
    html.style.touchAction = previousHtmlTouchAction;
    html.style.userSelect = previousHtmlUserSelect;
    body.style.overflow = previousBodyOverflow;
    body.style.overscrollBehavior = previousBodyOverscroll;
    body.style.touchAction = previousBodyTouchAction;
    body.style.userSelect = previousBodyUserSelect;
    container.style.touchAction = previousContainerTouchAction;
    container.style.overscrollBehavior = previousContainerOverscroll;
    container.style.overflow = previousContainerOverflow;
    interactiveElement.style.touchAction = previousElementTouchAction;
    interactiveElement.style.userSelect = previousElementUserSelect;
  };
}

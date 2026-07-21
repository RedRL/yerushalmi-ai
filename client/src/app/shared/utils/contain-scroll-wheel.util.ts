/** Prevents scroll chaining from a scrollable element to the page. */
export function containScrollWheel(event: WheelEvent, element: HTMLElement | null): void {
  event.stopPropagation();

  if (!element || element.scrollHeight <= element.clientHeight) {
    event.preventDefault();
    return;
  }

  const scrollingUp = event.deltaY < 0;
  const scrollingDown = event.deltaY > 0;
  const atTop = element.scrollTop <= 0;
  const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;

  if ((scrollingUp && atTop) || (scrollingDown && atBottom)) {
    event.preventDefault();
  }
}

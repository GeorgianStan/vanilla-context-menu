/**
 * Normalize the position of a target element so that it won't get out of bounds of the scope
 * @param mouse - mouseX and mouseY
 * @param target - target element that want to have it's position normalized
 * @param scope - the area to fit in
 */
export function normalizePozition(
  mouse: {
    x: number;
    y: number;
  },
  target: HTMLElement,
  scope: HTMLElement,
  normalized: boolean = true
): { normalizedX: number; normalizedY: number } {
  const { x: mouseX, y: mouseY } = mouse;

  if (!normalized) {
      let normalizedX: number = mouseX;
      let normalizedY: number = mouseY;
      return { normalizedX, normalizedY };
  }

  // compute what is the mouse position relative to the container element (scope)
  const { left: scopeOffsetX, top: scopeOffsetY } =
    scope.getBoundingClientRect();

  const scopeX: number = mouseX - scopeOffsetX;
  const scopeY: number = mouseY - scopeOffsetY;

  // check if the element will go out of bounds
  const outOfBoundsOnX: boolean =
    scopeX + target.clientWidth > scope.clientWidth;

  const outOfBoundsOnY: boolean =
    scopeY + target.clientHeight > scope.clientHeight;

  let normalizedX: number = mouseX;
  let normalizedY: number = mouseY;

  // normalzie on X
  if (outOfBoundsOnX) {
    normalizedX = scopeOffsetX + scope.clientWidth - target.clientWidth;
  }

  // normalize on Y
  if (outOfBoundsOnY) {
    normalizedY = scopeOffsetY + scope.clientHeight - target.clientHeight;
  }

  return { normalizedX, normalizedY };
}

/**
 *  Normalize the position of a target element so that it won't get out of bounds of the viewport.
 * @param initialPosition - the initial position
 * @param target - target element that want to have it's position normalized
 */
export function normalizePosition(
  initialPosition: {
    clientX: number;
    clientY: number;
  },
  target: HTMLElement
): { normalizedX: number; normalizedY: number } {
  const { clientX, clientY } = initialPosition;

  const targetCompStyles = getComputedStyle(target);
  const targetWidth = parseInt(targetCompStyles.getPropertyValue('width'));
  const targetHeight = parseInt(targetCompStyles.getPropertyValue('height'));

  const { innerWidth: maxSizeOnX, innerHeight: maxSizeOnY } = window;

  // Verify if the element will go out of bounds.
  const OUT_OF_BOUNDS_ON_X = clientX + targetWidth > maxSizeOnX;

  const OUT_OF_BOUNDS_ON_Y = clientY + targetHeight > maxSizeOnY;

  // Compute the normalized position.
  const normalizedX = OUT_OF_BOUNDS_ON_X
    ? window.innerWidth - targetWidth
    : clientX;

  const normalizedY = OUT_OF_BOUNDS_ON_Y
    ? window.innerHeight - targetHeight
    : clientY;

  return { normalizedX, normalizedY };
}

import { useCallback, useRef } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../contexts/AppContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function useTourMeasure() {
  const insets = useSafeAreaInsets();
  const { tourRoot, setTourRects } = useApp();
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);

  const publishRect = useCallback(
    (key: string, el: View | null, expandW = 0) => {
      if (!el) return;
      el.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setTourRects({
            [key]: {
              x: x - (tourRoot?.x ?? 0) - expandW / 2,
              y: y - (tourRoot?.y ?? 0),
              width: width + expandW,
              height,
            },
          });
        }
      });
    },
    [setTourRects, tourRoot],
  );

  const ensureVisible = useCallback(
    (key: string, el: View | null, expandW = 0, attempt = 0) => {
      if (!el) return;
      const publish = () => publishRect(key, el, expandW);
      el.measureInWindow((x, y, width, height) => {
        if (width <= 0 || height <= 0) {
          if (attempt < 5) {
            setTimeout(() => ensureVisible(key, el, attempt + 1), 250);
          }
          return;
        }
        const topPad = insets.top + 8;
        const bottomLimit = SCREEN_HEIGHT - (insets.bottom + 80);
        let desired: number | null = null;
        if (y < topPad) desired = topPad;
        else if (y + height > bottomLimit) desired = Math.max(topPad, bottomLimit - height);
        if (desired === null) {
          publish();
          return;
        }
        const newScroll = Math.max(0, scrollOffset.current + y - desired);
        scrollRef.current?.scrollTo({ y: newScroll, animated: true });
        setTimeout(publish, 430);
      });
    },
    [publishRect, insets.top, insets.bottom],
  );

  return { publishRect, ensureVisible, scrollRef, scrollOffset };
}

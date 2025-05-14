'use client';

import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { useState, forwardRef, useCallback } from 'react';

const trailingActions = (onSwipe: () => void) => (
  <TrailingActions>
    <SwipeAction
      destructive={true}
      onClick={onSwipe}
    >
      <div className='bg-red-500 rounded-3xl ml-1 text-white h-full w-full min-w-[96px] flex items-center justify-center transition-colors hover:bg-red-600 pr-10'>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
    </SwipeAction>
  </TrailingActions>
);

const Swipeable = forwardRef<HTMLDivElement, { children: React.ReactNode, onSwipe?: () => void }>(
  ({ children, onSwipe }, ref) => {
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeProgress, setSwipeProgress] = useState(0);

    const handleClick = useCallback((e: React.MouseEvent) => {
      if (isSwiping || swipeProgress > 0.2) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, [isSwiping, swipeProgress]);

    return (
      <div 
        ref={ref} 
        data-swiping={isSwiping} 
        data-swipe-progress={swipeProgress}
        onClick={handleClick}
      >
        <SwipeableList>
          <SwipeableListItem 
            trailingActions={trailingActions(onSwipe || (() => {}))} 
            className='bg-white shadow-sm rounded-3xl'
            onSwipeStart={() => {
              setIsSwiping(true);
              setSwipeProgress(0);
            }}
            onSwipeProgress={(progress) => {
              setSwipeProgress(progress);
            }}
            onSwipeEnd={() => {
              setIsSwiping(false);
              setSwipeProgress(0);
            }}
          >
            {children}
          </SwipeableListItem>
        </SwipeableList>
      </div>
    );
  }
);

Swipeable.displayName = 'Swipeable';

export default Swipeable;
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Skeleton } from "@mui/material";
import FoodCard from "./FoodCard";
import { CARD_TOTAL_HEIGHT } from "./CommonCard";
import foodService from "../services/foodService";

const CARD_W     = 200;
const PAGE_SIZE  = 5;
const SCROLL_SPD = 0.8; // px per animation frame

export default function LatestFoodsCarousel() {
  const [foods, setFoods]             = useState([]);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const navigate    = useNavigate();
  const scrollRef   = useRef(null);
  const sentinelRef = useRef(null);
  const rafRef      = useRef(null);
  const pausedRef   = useRef(false); // true while hovered or dragging
  const dragRef     = useRef({ dragging: false, startX: 0, scrollLeft: 0 });

  // Refs that mirror state so RAF/Observer callbacks always read fresh values
  const hasMoreRef     = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);
  const loadingRef     = useRef(loading);
  const pageRef        = useRef(page);
  useEffect(() => { hasMoreRef.current = hasMore; },         [hasMore]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);
  useEffect(() => { loadingRef.current = loading; },         [loading]);
  useEffect(() => { pageRef.current = page; },               [page]);

  const loadPage = useCallback(async (pg) => {
    if (pg === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await foodService.getLatestFoods({ page: pg, limit: PAGE_SIZE });
      setFoods((prev) => pg === 1 ? (data.foods || []) : [...prev, ...(data.foods || [])]);
      setHasMore(data.hasMore ?? false);
      setPage(pg);
    } catch {
      setHasMore(false);
    } finally {
      if (pg === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadPage(1); }, [loadPage]);

  // Auto-scroll loop — starts after initial load, pauses on hover/drag
  useEffect(() => {
    if (loading || foods.length === 0) return;

    const tick = () => {
      const el = scrollRef.current;
      if (el && !pausedRef.current) {
        el.scrollLeft += SCROLL_SPD;

        const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 40;

        if (nearEnd) {
          if (hasMoreRef.current && !loadingMoreRef.current) {
            // Load next page — new cards will extend the scroll width
            loadPage(pageRef.current + 1);
          } else if (!hasMoreRef.current) {
            // All items loaded — loop back to start seamlessly
            el.scrollLeft = 0;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loading, foods.length, loadPage]);

  // IntersectionObserver (fallback trigger for manual scroll)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root     = scrollRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMoreRef.current &&
          !loadingMoreRef.current &&
          !loadingRef.current
        ) {
          loadPage(pageRef.current + 1);
        }
      },
      { root, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadPage, loading]);

  // Non-passive wheel → manual horizontal scroll
  const handleWheel = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY + e.deltaX;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel, loading]);

  // Drag scroll
  const onMouseDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    pausedRef.current = true;
    dragRef.current = { dragging: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    el.style.cursor     = "grabbing";
    el.style.userSelect = "none";
  };
  const onMouseMove = (e) => {
    if (!dragRef.current.dragging) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = dragRef.current.scrollLeft - (e.pageX - el.offsetLeft - dragRef.current.startX);
  };
  const onMouseUp = () => {
    dragRef.current.dragging = false;
    // Keep paused while mouse is still over the element (onMouseLeave will unpause)
    if (scrollRef.current) {
      scrollRef.current.style.cursor     = "grab";
      scrollRef.current.style.userSelect = "";
    }
  };

  if (loading) {
    return (
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          Latest Foods Added
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <Skeleton
              key={i} variant="rounded"
              width={CARD_W} height={CARD_TOTAL_HEIGHT}
              sx={{ flexShrink: 0, borderRadius: 2 }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (foods.length === 0) return null;

  return (
    <Box sx={{ mb: 3.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
        Latest Foods Added
      </Typography>

      <Box
        ref={scrollRef}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; dragRef.current.dragging = false; }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          pb: 1,
          cursor: "grab",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
        }}
      >
        {foods.map((food) => (
          <Box
            key={food.foodId || food.id}
            sx={{ width: CARD_W, minWidth: CARD_W, flexShrink: 0 }}
          >
            <FoodCard
              food={food}
              onClick={() => navigate(`/customer/food/${food.foodId || food.id}`)}
            />
          </Box>
        ))}

        {loadingMore && [...Array(3)].map((_, i) => (
          <Skeleton
            key={`more-${i}`} variant="rounded"
            width={CARD_W} height={CARD_TOTAL_HEIGHT}
            sx={{ flexShrink: 0, borderRadius: 2 }}
          />
        ))}

        {/* Sentinel for IntersectionObserver (manual scroll fallback) */}
        <Box ref={sentinelRef} sx={{ width: 4, flexShrink: 0, alignSelf: "stretch" }} />
      </Box>
    </Box>
  );
}

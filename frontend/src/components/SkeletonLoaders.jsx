import { Box, Card, CardContent, Skeleton } from "@mui/material";

/**
 * SkeletonLoaders — named exports for skeleton loading states using MUI Skeleton.
 */

/** Food card with image placeholder + 3 text lines */
export function FoodCardSkeleton() {
  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Skeleton variant="rectangular" height={160} animation="wave" />
      <CardContent>
        <Skeleton variant="text" width="70%" height={22} animation="wave" />
        <Skeleton variant="text" width="50%" height={18} animation="wave" sx={{ mt: 0.5 }} />
        <Skeleton variant="text" width="40%" height={18} animation="wave" sx={{ mt: 0.5 }} />
      </CardContent>
    </Card>
  );
}

/** Order list row with avatar + 2 text lines */
export function OrderRowSkeleton() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, px: 2 }}>
      <Skeleton variant="circular" width={44} height={44} animation="wave" />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={20} animation="wave" />
        <Skeleton variant="text" width="40%" height={16} animation="wave" sx={{ mt: 0.5 }} />
      </Box>
      <Skeleton variant="rounded" width={60} height={26} animation="wave" />
    </Box>
  );
}

/** Dashboard stat card with number + label */
export function DashboardStatSkeleton() {
  return (
    <Card sx={{ borderRadius: 3, p: 2 }}>
      <Skeleton variant="text" width="40%" height={42} animation="wave" />
      <Skeleton variant="text" width="65%" height={18} animation="wave" sx={{ mt: 1 }} />
    </Card>
  );
}

/** Profile block with avatar + name + 2 fields */
export function ProfileSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 3 }}>
      <Skeleton variant="circular" width={80} height={80} animation="wave" />
      <Skeleton variant="text" width={160} height={26} animation="wave" />
      <Skeleton variant="rounded" width="100%" height={52} animation="wave" />
      <Skeleton variant="rounded" width="100%" height={52} animation="wave" />
    </Box>
  );
}

/** Table row with N cells */
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 2,
        px: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" height={20} animation="wave" />
      ))}
    </Box>
  );
}

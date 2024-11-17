import { Skeleton } from "@/components/ui/skeleton";

export const LoadingTable = ({ rows }: { rows?: number }) => {
  return (
    <div className="mt-8">
      {[...Array(rows ?? 8)].map((_, i) => (
        <Skeleton
          key={i}
          className="m-2 h-8 rounded-md animate-pulse"
        ></Skeleton>
      ))}
    </div>
  );
};

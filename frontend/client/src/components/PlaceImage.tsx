import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  buildPlaceQuery,
  fetchPlaceImage,
  getLocationImageQueryKey,
  getPlaceholderGradient,
  parseDestinationLabel,
  type LocationImageRequest,
  type LocationImageType,
} from "@/lib/placeImages";

type PlaceImageLookup = LocationImageRequest | { query: string; type?: LocationImageType };

function normalizeLookup(lookup: PlaceImageLookup): LocationImageRequest {
  if ("query" in lookup) {
    const parsed = parseDestinationLabel(lookup.query);
    return { ...parsed, type: lookup.type ?? parsed.type };
  }
  return lookup;
}

interface PlaceImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  country?: string;
  query?: string;
  imageUrl?: string | null;
  type?: LocationImageType;
  showSkeleton?: boolean;
}

export function PlaceImage({
  name,
  country,
  query,
  imageUrl,
  type = "destination",
  alt,
  className,
  showSkeleton = true,
  onError,
  ...props
}: PlaceImageProps) {
  const hasCurated = Boolean(imageUrl?.trim());
  const lookup = hasCurated
    ? null
    : normalizeLookup(name ? { name, country, type } : { query: query ?? "", type });
  const label = lookup
    ? buildPlaceQuery(lookup.name, lookup.country)
    : alt ?? "Destination";

  const { data, isLoading } = useQuery({
    queryKey: lookup ? getLocationImageQueryKey(lookup) : ["place-image", "curated", imageUrl],
    queryFn: () => fetchPlaceImage(lookup!),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: Boolean(lookup?.name.trim()),
  });

  if (!hasCurated && isLoading && showSkeleton) {
    return <div className={cn("bg-muted animate-pulse", className)} aria-hidden />;
  }

  const src = imageUrl?.trim() || data?.imageUrl || getPlaceholderGradient(label);

  return (
    <img
      src={src}
      alt={alt ?? label}
      className={className}
      onError={(event) => {
        if (event.currentTarget.src !== getPlaceholderGradient(label)) {
          event.currentTarget.onerror = null;
          event.currentTarget.src = getPlaceholderGradient(label);
        }
        onError?.(event);
      }}
      {...props}
    />
  );
}

interface PlaceImageBackgroundProps {
  name?: string;
  country?: string;
  query?: string;
  imageUrl?: string | null;
  type?: LocationImageType;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
}

export function PlaceImageBackground({
  name,
  country,
  query,
  imageUrl,
  type = "destination",
  className,
  overlayClassName = "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4))",
  children,
}: PlaceImageBackgroundProps) {
  const hasCurated = Boolean(imageUrl?.trim());
  const lookup = hasCurated
    ? null
    : normalizeLookup(name ? { name, country, type } : { query: query ?? "", type });
  const label = lookup
    ? buildPlaceQuery(lookup.name, lookup.country)
    : "Destination";

  const { data, isLoading } = useQuery({
    queryKey: lookup ? getLocationImageQueryKey(lookup) : ["place-image", "curated", imageUrl],
    queryFn: () => fetchPlaceImage(lookup!),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: Boolean(lookup?.name.trim()),
  });

  const resolved = imageUrl?.trim() || data?.imageUrl || getPlaceholderGradient(label);

  return (
    <div
      className={cn(
        "bg-cover bg-center relative",
        !hasCurated && isLoading && "bg-muted animate-pulse",
        className,
      )}
      style={
        !hasCurated && isLoading
          ? undefined
          : {
              backgroundImage: `${overlayClassName}, url(${resolved})`,
            }
      }
    >
      {children}
    </div>
  );
}

export { buildPlaceQuery, parseDestinationLabel };

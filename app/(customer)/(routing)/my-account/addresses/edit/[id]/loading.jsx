export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Page Title Skeleton */}
      <div className="mb-6 h-7 w-40 animate-pulse rounded bg-gray-200" />

      {/* Form Skeleton */}
      <div className="space-y-6 rounded border border-gray-300 bg-gray-50 p-6 shadow">
        {/* First & Last Name */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SkeletonInput />
          <SkeletonInput />
        </div>

        {/* Company */}
        <SkeletonInput />

        {/* Address */}
        <SkeletonInput />
        <SkeletonInput />

        {/* City */}
        <SkeletonInput />

        {/* State */}
        <SkeletonInput />

        {/* Postcode */}
        <SkeletonInput />

        {/* Country */}
        <SkeletonInput />

        {/* Phone */}
        <SkeletonInput />

        {/* Email */}
        <SkeletonInput />

        {/* Submit Button */}
        <div className="h-10 w-32 animate-pulse rounded bg-blue-300" />
      </div>
    </div>
  );
}

/* -----------------------------------------
   SKELETON INPUT COMPONENT
------------------------------------------ */
function SkeletonInput() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
      <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
    </div>
  );
}

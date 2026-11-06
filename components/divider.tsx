export function Divider({ className }: { className?: string }) {
  return (
    <section
      className={`
          ${className}
          relative
          h-4
          before:content
          before:absolute
          before:w-[200vw]
          before:border-b
          before:border-gray-500/20
          before:left-1/2
          before:-translate-x-1/2
          before:-bottom-px
          after:content
          after:absolute
          after:w-[200vw]
          after:border-t
          after:border-gray-500/20
          after:left-1/2
          after:-translate-x-1/2
          after:-top-px
          `}
    />
  );
}

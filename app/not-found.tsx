import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ background: '#0a0a0b' }}>
      <p className="label-mono mb-6 text-[10px] text-[var(--blood)]">SIGNAL LOST</p>
      <h1 className="display-hero text-[28vw] text-[var(--bone)] sm:text-[12rem]">404</h1>
      <p className="font-serif-italic mt-4 max-w-md text-xl text-[var(--ash)]">
        The void remembers nothing. This transmission is not in the index.
      </p>
      <Link
        href="/"
        className="mt-10 bg-[var(--blood)] px-8 py-4 label-mono text-[10px] text-[var(--bone)] transition hover:bg-[var(--ember)]"
      >
        RETURN TO THE INDEX
      </Link>
    </div>
  );
}

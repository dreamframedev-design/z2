import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] px-4 text-center">
      <p className="mb-4 font-mono text-[10px] tracking-[0.4em] text-red-400/80">
        [ SIGNAL LOST // SEARCHING... ]
      </p>
      <h1 className="mb-4 text-6xl font-light text-slate-200">404</h1>
      <p className="mb-8 max-w-md text-sm text-slate-500">
        The void remembers nothing. This transmission does not exist in the guild registry.
      </p>
      <Link
        href="/"
        className="border border-slate-700 px-6 py-3 font-mono text-xs tracking-widest text-slate-400 transition hover:border-amber-500/40 hover:text-amber-400"
      >
        [ RETURN TO SCANNER ]
      </Link>
    </div>
  );
}

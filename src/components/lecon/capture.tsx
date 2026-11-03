/* eslint-disable @next/next/no-img-element -- captures statiques de public/, taille inconnue à l'avance */

// Capture d'écran de l'éditeur dans une leçon : l'image (limitée en hauteur pour tenir dans l'écran) et sa légende.
// Les images sont rangées dans public/cours/<projet>/... et citées avec un chemin qui commence par /cours/.
export function Capture({ src, legende }: { src: string; legende: string }) {
  return (
    <figure className="my-4 flex flex-col items-start gap-2">
      <a href={src} target="_blank" rel="noreferrer" title="Ouvrir en grand">
        <img src={src} alt={legende} loading="lazy" className="max-h-[52vh] w-auto max-w-full rounded-xl border border-ligne" />
      </a>
      <figcaption className="text-[14px] text-encre-2">{legende}</figcaption>
    </figure>
  );
}

import { imageCredits } from "@/lib/image-credits";
import { Reveal, RevealImage } from "./reveal";

const full = "(min-width: 1152px) 1104px, 100vw";
const pairFrame = "aspect-[4/3] md:aspect-auto md:h-[26rem]";

export function AntarcticGallery() {
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <RevealImage
        image={imageCredits.issAuroraAustralis}
        from="depth"
        className="md:col-span-12"
        frameClassName="aspect-[3/2]"
        sizes={full}
      />
      <RevealImage
        image={imageCredits.byrdGlacier}
        from="left"
        className="md:col-span-5 md:row-span-2"
        frameClassName="aspect-[3/4] md:aspect-auto md:flex-1 md:min-h-[28rem]"
        sizes="(min-width: 768px) 42vw, 100vw"
      />
      <RevealImage
        image={imageCredits.bharatiStation}
        from="right"
        className="md:col-span-7"
        frameClassName="aspect-[3/2]"
        sizes="(min-width: 768px) 58vw, 100vw"
      />
      <RevealImage
        image={imageCredits.maitriAerial}
        from="right"
        className="md:col-span-7"
        frameClassName="aspect-[4/3]"
        sizes="(min-width: 768px) 58vw, 100vw"
      />
      <RevealImage
        image={imageCredits.dakshinGangotri}
        from="left"
        className="md:col-span-7"
        frameClassName={pairFrame}
        sizes="(min-width: 768px) 58vw, 100vw"
      />
      <RevealImage
        image={imageCredits.adeliePenguins}
        from="right"
        className="md:col-span-5"
        frameClassName={pairFrame}
        sizes="(min-width: 768px) 42vw, 100vw"
      />
    </div>
  );
}

export function ArcticGallery() {
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <RevealImage
        image={imageCredits.polarBearSvalbard}
        from="depth"
        className="md:col-span-12"
        frameClassName="aspect-[16/9]"
        sizes={full}
      />
      <RevealImage
        image={imageCredits.raudfjordbreen}
        from="left"
        className="md:col-span-8"
        frameClassName={pairFrame}
        sizes="(min-width: 768px) 66vw, 100vw"
      />
      <RevealImage
        image={imageCredits.nyAlesundTown}
        from="right"
        className="md:col-span-4"
        frameClassName={pairFrame}
        sizes="(min-width: 768px) 34vw, 100vw"
      />
      <Reveal from="left" className="md:col-span-4 md:self-end md:pb-12">
        <p className="text-pretty text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Himadri stands in Ny-Alesund, on the shore of Kongsfjorden, one of
          the northernmost research villages on Earth.
        </p>
      </Reveal>
      <RevealImage
        image={imageCredits.kongsfjorden}
        from="right"
        className="md:col-span-8"
        frameClassName="aspect-[4/3]"
        sizes="(min-width: 768px) 66vw, 100vw"
      />
    </div>
  );
}

export function HimalayanGallery() {
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <RevealImage
        image={imageCredits.himalayaRanikhet}
        from="depth"
        className="md:col-span-12"
        frameClassName="aspect-[3/1] md:aspect-[4/1]"
        sizes={full}
      />
      <RevealImage
        image={imageCredits.pindariGlacier}
        from="left"
        className="md:col-span-5"
        frameClassName={pairFrame}
        sizes="(min-width: 768px) 42vw, 100vw"
      />
      <RevealImage
        image={imageCredits.gaumukhGangotri}
        from="right"
        className="md:col-span-7"
        frameClassName={pairFrame}
        sizes="(min-width: 768px) 58vw, 100vw"
      />
    </div>
  );
}

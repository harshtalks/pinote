"use client";

import { Option, pipe } from "effect";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";

const defaultVectors = [
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53573df5fa1a2163f8ed70_peep-48.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535b9746008059478ec0d0_peep-85.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535a489588e0fbe97f7fd8_peep-74.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535367f5fa1a2eedf59e1d_peep-23.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5355ed4600809f5a8dad51_peep-37.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5354762b568a35a017730e_peep-30.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5352709588e06bd47b75e0_peep-19.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5359ee8becbf772f53c5d4_peep-71.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5356df7371bb368f9e42af_peep-45.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535bb6e35d38cae7684f8c_peep-86.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5358878e2493fbea064dd9_peep-59.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535a83d3992372c25556b9_peep-76.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53566767293a5a435c41a7_peep-41.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535822c99250c79ec8c2e3_peep-55.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5358a764109d50aa01705d_peep-60.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535c42c67e79a7a6962d19_peep-91.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535c7a550b76084df7d544_peep-93.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535686f5fa1a3aa6f812cb_peep-42.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535c92c67e790fd496656f_peep-94.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5351f351970522b7a2499d_peep-15.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5359d28becbf257453bece_peep-70.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535d808becbf7162555033_peep-102.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535aa1d871310896104715_peep-77.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5354037488c27f4c47477f_peep-27.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535cf47488c27eb04a70d1_peep-97.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5357a8c992500f5fc84f40_peep-52.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5356a1c992503c9ac79686_peep-43.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53570264109d16a7014c37_peep-46.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535b57f5fa1ab5dbfc2764_peep-83.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535b7a8becbf1fc35460c4_peep-84.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535774550b76692f531a8_peep-50.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535d68c6b2498a0c2cbf6a_peep-101.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53517d8becbf5fe24ff444_peep-11.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535cd6c67e798b229699d1_peep-96.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535a2b8e24938384074dac_peep-73.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5350f9d399238698511b2f_peep-7.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5356be67293a8a335c71b0_peep-44.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5351b17371bb6c489ad0cc_peep-13.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5358c38e249393f1066ab8_peep-61.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535421d399233b9b529696_peep-28.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5353e82b568af2d916cbbd_peep-26.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535ac39b55b0379854a1d8_peep-78.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535b1d67293aaf6b5e7a33_peep-81.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535da59588e079598123fc_peep-103.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535216550b76cb4af21e3d_peep-16.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53534d67293a6fe95a9616_peep-22.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53575a550b769098f5249d_peep-49.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535858f5fa1a45cdfa3a07_peep-57.svg",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5359b47371bb97b7a01b27_peep-69.svg",
];

export const postHumansVectors = [
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d190d6faa5e45333b85ae6_pacheco.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d190c182efd7fa3c5ac033_pondering.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4c2274b417b090395329_plants.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4d0d89236fc80a3395b4_runner.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4b0849333dd65b9525a6_coffee.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d18f3612fc6b2613d1c073_kiddo.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4cf165d907b29682f236_reflecting.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4b9065d907b296812105_groceries.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d9c4a98635fca2c709df73_fling.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4bff9a10126e545d80ab_meela-pantalones.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4bb186f25148606d5790_jumping-air.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4b4c49ec3a4d94fff220_experiments.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4b1aa5bcc50de231dfb4_consumer.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d18f22bd4dfae30b7ea399_astro.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4d3249ec3a4d94020db3_whoa.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4bbcbc2ded17ba200a97_late-for-class.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d9c64fb20aa28a2850f036_chaotic-good.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4ae7f0da0e3228c9e64c_chilly.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4c1f93603c845f7c8154_polka-pup.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4bf3d05d69cba1e51fb2_new-beginnings.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d9c57f3431692037f48232_feliz.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4ce4f47cd9cfb4c564a9_puppy.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4aba2a4c88ee00b532c5_bueno.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4b9bf0da0e3228caa6d0_growth.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d18f12c3c7254f542da85a_rogue.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4b3eaa3b6a1d9a42e55c_entertainment.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4be4f47cd9cfb4c443cb_mechanical-love.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4b8241e30d1ff98179ad_gamestation.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4b323f2f3437eef3035d_ecto-plasma.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4d1949333dd65b97493f_waiting.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4d3cb1d3c8db3605f80b_wont-stop.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4ad349ec3a4d94ff7554_chillin.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4d2566d2149b3c426c48_walking-contradiction.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4b2686f25148606c9181_cube-leg.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4d0257f3906c2314e093_roboto.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4bd987b3cd2ec6bf44df_mask.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4bc8ac170c083bba7e85_looking-ahead.png",
  "https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d18f01ee89ff2192ed113d_pilot.png",
];

export const RandomVectors = ({
  vectors,
  className,
}: {
  vectors?: string[];
  className?: string;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedVectors = vectors || defaultVectors;
  const imageCache = useRef(new Map<string, HTMLImageElement>());

  useEffect(() => {
    selectedVectors.forEach((src) => {
      if (!imageCache.current.has(src)) {
        const img = new Image(200, 200);
        img.src = src;
        imageCache.current.set(src, img);
      }
    });
  }, [selectedVectors]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * selectedVectors.length);
        } while (newIndex === prevIndex);
        return newIndex;
      });
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [selectedVectors.length]);

  const currentImage = pipe(
    Option.fromNullable(selectedVectors[activeIndex]),
    Option.map((el) => imageCache.current.get(el)),
    Option.filter((el) => !!el),
    Option.match({
      onSome: (img) => img,
      onNone: () => null,
    }),
  );

  return (
    <div className="text-center">
      {currentImage && (
        <NextImage
          src={currentImage.src}
          width={200}
          height={200}
          className={className}
          alt="Random vector"
        />
      )}
    </div>
  );
};

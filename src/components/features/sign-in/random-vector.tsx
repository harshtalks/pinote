"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const vectors = [
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

export const RandomVectors = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * vectors.length);
        } while (newIndex === prevIndex);
        return newIndex;
      });
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="text-center">
      {vectors[activeIndex] && (
        <Image
          src={vectors[activeIndex]}
          alt="Random vector"
          height={200}
          width={200}
        />
      )}
    </div>
  );
};

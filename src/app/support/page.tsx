import Image from "next/image";
import agribank from "../../../public/agribank.jpg";
import mbbank from "../../../public/mbbank.png";

export default function Support() {
  return (
    <main>
      <div className="mt-8 w-full">
        <div className="flex secondary-color-text items-center py-5">
          <Image
            src={agribank}
            width={30}
            height={30}
            alt="agribank"
            className="rounded-xl"
          />
          <p className="px-2">Agribank - 2015220027660 - LE THANH DAT</p>
        </div>
        <div className="flex secondary-color-text items-center py-5">
          <Image
            src={mbbank}
            width={30}
            height={30}
            alt="mbbank"
            className="rounded-xl"
          />
          <p className="px-2">MB Bank - 0388121738 - LE THANH DAT</p>
        </div>
        <h1 className="my-10 text-2xl secondary-color-text">
          Thanks for the donation :)
        </h1>
      </div>
    </main>
  );
}

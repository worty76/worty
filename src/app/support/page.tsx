"use client";

import Image from "next/image";
import agribank from "../../../public/images/agribank.jpg";
import mbbank from "../../../public/images/mbbank.png";

export default function Support() {
  const myBanks = [
    {
      bankLogo: agribank,
      message: "Agribank - 2015220027660 - LE THANH DAT"
    },
    {
      bankLogo: mbbank,
      message: "MB Bank - 0388121738 - LE THANH DAT"
    },
  ]

  return (
    <main>
      <div className="mt-8 w-full">
        {myBanks.map((bank, index) => {
          return (
            <div key={index} className="flex items-center py-5">
              <Image
                src={bank.bankLogo}
                width={45}
                height={45}
                alt="banks"
                className="rounded-xl object-contain "
              />
              <p className="px-2">{bank.message}</p>
            </div>
          )
        })}
        <h1 className="my-10 text-2xl text-center">
          Thanks for the donation. Have you a good day :3 
        </h1>
      </div>
    </main>
  );
}

"use client";

import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import agribank from "../../../public/images/agribank.jpg";
import mbbank from "../../../public/images/mbbank.png";

export default function Support() {
  const myBanks = [
    {
      bankLogo: agribank,
      message: "Agribank - 2015220027660 - LE THANH DAT",
      clipboard: "2015220027660",
    },
    {
      bankLogo: mbbank,
      message: "MB Bank - 0388121738 - LE THANH DAT",
      clipboard: "0388121738",
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      duration: 2000,
      className: "secondary-color-bg secondary-color-text",
    });
  };

  return (
    <main className="w-[95%] max-w-[1100px] mx-auto">
      <Toaster position="bottom-center" />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-center mb-12 secondary-color-text duration-1000">
          If you find my work helpful, you can support me through these channels
        </p>

        <div className="space-y-4">
          {myBanks.map((bank, index) => (
            <div
              key={index}
              className="rounded-lg shadow-md p-6 transition-all hover:shadow-lg duration-1000 cursor-pointer secondary-color-border"
              onClick={() => handleCopy(bank.clipboard)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg">
                  <Image
                    src={bank.bankLogo}
                    width={48}
                    height={48}
                    alt="bank logo"
                    className="rounded-lg object-contain"
                  />
                </div>
                <div>
                  <p className="font-medium secondary-color-text duration-1000">
                    {bank.message}
                  </p>
                  <p className="text-sm mt-1 secondary-color-text duration-1000">
                    Click to copy
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-2xl font-medium secondary-color-text duration-1000">
            Thanks for Your Support! 🙏
          </p>
          <p className="mt-2 secondary-color-text duration-1000">
            Your donation helps me continue creating and maintaining projects
          </p>
        </div>
      </div>
    </main>
  );
}

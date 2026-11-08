"use client";

import Image from "next/image";
import { toast } from "react-hot-toast";
import mbbank from "../../../public/images/mbbank.png";

export default function Support() {
  const myBanks = [
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
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mg-head mb-12">
          <span className="mg-kana">応援</span>
          <p className="secondary-color-text duration-1000">
            If you find my work helpful, you can support me through these channels
          </p>
        </div>

        <div className="space-y-4">
          {myBanks.map((bank, index) => (
            <div
              key={index}
              className="mg-panel p-6 cursor-pointer"
              onClick={() => handleCopy(bank.clipboard)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-[3px] border-2 border-[rgb(var(--primary-text-rgb)_/_0.8)] bg-white">
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
                  <p className="mt-2">
                    <span className="mg-caption !text-[10px]">Click to copy</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <span className="mg-end secondary-color-text">ありがとう</span>
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

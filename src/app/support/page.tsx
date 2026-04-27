"use client";

import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { FaCopy, FaHeart } from "react-icons/fa";
import agribank from "../../../public/images/agribank.jpg";
import mbbank from "../../../public/images/mbbank.png";

export default function Support() {
  const myBanks = [
    {
      bankLogo: agribank,
      bankName: "Agribank",
      accountName: "LE THANH DAT",
      accountNumber: "2015220027660",
      clipboard: "2015220027660",
    },
    {
      bankLogo: mbbank,
      bankName: "MB Bank",
      accountName: "LE THANH DAT",
      accountNumber: "0388121738",
      clipboard: "0388121738",
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      duration: 2000,
      iconTheme: { primary: "#ddd6b6", secondary: "#262223" },
    });
  };

  return (
    <main className="w-[95%] max-w-[700px] mx-auto py-20">
      <Toaster position="bottom-center" />

      <div className="text-center mb-12">
        <h1 className="text-3xl font-heading font-bold secondary-color-text mb-3">
          Support My Work
        </h1>
        <p className="secondary-color-text opacity-60 leading-relaxed">
          If you find my work helpful, buying me a coffee means a lot ☕
        </p>
      </div>

      <div className="space-y-4">
        {myBanks.map((bank, index) => (
          <div
            key={index}
            className="group rounded-2xl border secondary-color-border bg-white/5 backdrop-blur-sm p-5 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Image
                  src={bank.bankLogo}
                  width={36}
                  height={36}
                  alt={bank.bankName}
                  className="rounded-lg object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold secondary-color-text text-sm">
                  {bank.bankName}
                </p>
                <p className="secondary-color-text opacity-80 text-sm font-mono mt-0.5 tracking-wide">
                  {bank.accountNumber}
                </p>
                <p className="secondary-color-text opacity-50 text-xs mt-0.5">
                  {bank.accountName}
                </p>
              </div>

              <button
                onClick={() => handleCopy(bank.clipboard)}
                className="shrink-0 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Copy account number"
              >
                <FaCopy className="secondary-color-text opacity-60 group-hover:opacity-100 transition-opacity" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border secondary-color-border">
          <FaHeart className="text-red-400/80" size={14} />
          <p className="secondary-color-text opacity-70 text-sm">
            Thanks for your support!
          </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import Image from "next/image";
import agribank from "../../../public/images/agribank.jpg";
import mbbank from "../../../public/images/mbbank.png";
import { colors } from "@/common/styles/colors";

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
    alert("Copied to clipboard!");
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: colors.primary.background }}
    >
      <div className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-center mb-12" style={{ color: colors.primary.text }}>
          If you find my work helpful, you can support me through these channels
        </p>

        <div className="space-y-4">
          {myBanks.map((bank, index) => (
            <div
              key={index}
              className="rounded-lg shadow-md p-6 transition-all hover:shadow-lg cursor-pointer"
              style={{
                background: colors.primary.background,
                border: `1px solid ${colors.primary.text}`,
              }}
              onClick={() => handleCopy(bank.clipboard)}
            >
              <div className="flex items-center space-x-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: `${colors.primary.text}1a` }}
                >
                  <Image
                    src={bank.bankLogo}
                    width={48}
                    height={48}
                    alt="bank logo"
                    className="rounded-lg object-contain"
                  />
                </div>
                <div>
                  <p
                    className="font-medium"
                    style={{ color: colors.primary.text }}
                  >
                    {bank.message}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: `${colors.primary.text}b3` }}
                  >
                    Click to copy
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2
            className="text-2xl font-medium"
            style={{ color: colors.primary.text }}
          >
            Thanks for Your Support! 🙏
          </h2>
          <p className="mt-2" style={{ color: `${colors.primary.text}b3` }}>
            Your donation helps me continue creating and maintaining projects
          </p>
        </div>
      </div>
    </main>
  );
}

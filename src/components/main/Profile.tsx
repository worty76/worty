"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { socialLinks } from "../../utils/social-links";
import author from "../../../public/images/me.jpg";
import { fetchCollectionCached } from "@/lib/firestore-cache";

interface ProfileDoc {
  id: string;
  avatarUrl?: string;
}

export const Profile = () => {
  // Custom avatar set from the admin panel (profile/main doc); falls back to
  // the bundled photo when none is set
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const docs = await fetchCollectionCached<ProfileDoc>("profile");
        const main = docs.find((d) => d.id === "main");
        if (main?.avatarUrl) setAvatarUrl(main.avatarUrl);
      } catch {
        // keep the default photo
      }
    };
    load();
  }, []);

  return (
    <div className="flex items-center">
      <div className="relative w-[150px] h-[150px] md:hover:w-[256px] md:hover:h-[256px] duration-1000">
        <Image
          src={avatarUrl ?? author}
          fill
          alt="Picture of the author"
          className="rounded-xl object-cover"
          sizes="(max-width: 768px) 150px, 256px"
        />
      </div>
      <div className="pl-5">
        <div className="flex justify-around w-32">
          {socialLinks.map(({ uri, icon, label }, index) => (
            <a
              href={uri}
              key={index}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon
                icon={icon}
                className="cursor-pointer duration-1000 rounded-md hover:opacity-80"
                style={{
                  color: "var(--color-primary-text)",
                  width: "20px",
                  height: "20px",
                }}
              />
            </a>
          ))}
        </div>
        <p className="text-sm pt-2 duration-1000">
          <i>&quot;Simplicity is the ultimate sophistication.&quot;</i>
        </p>
      </div>
    </div>
  );
};

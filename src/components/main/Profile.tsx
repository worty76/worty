import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { socialLinks } from "../../config/socialLinks";
import author from "../../../public/images/me.jpg";

export const Profile = () => {
  return (
    <div className="flex items-center">
      <div className="relative w-[150px] h-[150px] md:hover:w-[256px] md:hover:h-[256px] duration-1000">
        <Image
          src={author}
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

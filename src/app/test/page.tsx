"use client";

import Image from "next/image";

export default function Page() {
  return (
    <div>
      <main>
        <div className="secondary-color-text flex">Personal</div>
        <h1 className="my-5 text-4xl secondary-color-text font-bold">
          How i could not escape my gaming habits
        </h1>
        <p className="secondary-color-text">Date: MONDAY, DECEMBER 14, 2009</p>
      </main>
      <div className="w-full justify-center flex py-5 px-5">
        <Image
          src={
            "https://video-images.vice.com/articles/5e3d3ad62540b0009c92a509/lede/1581350007250-gaming_addiction1-copy.jpeg?crop=1xw:0.843558282208589xh;center,center"
          }
          width={1300}
          height={240}
          quality={100}
          priority
          style={{
            height: "auto",
          }}
          className="rounded-md shadow-lg outline outline-1 outline-body-800 object-cover wide-media overflow-hidden object-fit-cover h-auto"
          alt="author"
        />
      </div>
      <article className="lg:px-0 larger-line-height text-xl leading-10 my-2xl leading-looser w-full px-5">
        <p className="py-10 text-2xl text-[#BBB0A4] text-center">
          My journey before going to college
        </p>
        <div className="secondary-color-text pb-10">
          <p className="pt-5">
          In recent days, online games have become one of the most influential elements in society. They are entertainment tools created by intelligent and skilled programmers. Online games have experienced rapid development and diversity in terms of genres and various graphic styles. However, they have also been cautioned as a danger similar to addiction, leading players to become obsessed and disconnected from the outside world.
          </p>
          <p className="pt-5">
          Like many others who have spent a significant amount of time on online games, I too was one of them. During my middle and high school years, I probably devoted the most time to gaming. While my peers were studying and exploring new things in life, I engaged in activities that seemed pointless. I couldn't manage my time and behavior, couldn't stop playing games, and couldn't control myself. I was lax in self-discipline and lived a carefree daily life.
          </p>
          <p className="pt-5">
          Sometimes, when people around me inquired about my plans and future steps, I would simply laugh it off and brush it aside, only to return to playing games even more to forget about my own concerns. Seeing my friends achieve academic success through hard work while my own efforts revolved around winning meaningless games, I felt like I was falling behind and experiencing regret.
          </p>
          <p className="pt-5">
          The final months before graduating from high school were a time for students to contemplate their future careers. I pondered extensively on the fields I was passionate about and realized that the time I spent playing online games had contributed, in part, to my choice of a career path aligned with my interests. I discovered a deep and passionate love for computers within myself. I still remember when I first laid eyes on my father's computer; I was genuinely fascinated and had a special fascination with it. The computer's interface seemed small and sleek, yet the things that appeared on its screen introduced me to a world of modern technology that I had never seen before.
          </p>
          <p className="pt-5">
          During the days when I was heavily immersed in gaming, I became increasingly proficient in using computers. This proficiency would later prove to be a significant advantage in my chosen field of Information Technology. There was a period when I felt foolish for believing I was inadequate in academics, as I couldn't keep up with my classmates and couldn't satisfy my parents' expectations. However, I came to realize that my struggles in academics weren't due to incompetence but rather a result of feeling more significant and responsible for my own learning.
          </p>
          <p className="pt-5">
          So, if you find yourself in a situation similar to mine, I encourage you to reassess and learn to use your time wisely. Proper time management is crucial!
          </p>
        </div>
      </article>
    </div>
  );
}

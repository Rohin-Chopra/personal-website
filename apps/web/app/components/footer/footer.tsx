import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => (
  <footer className="w-full border-t border-t-primary py-5 text-center dark:text-white md:py-10">
    <div className="mb-2 text-xl font-bold">
      <span className="font-josefin">ROHIN CHOPRA</span>
    </div>
    <div className="flex justify-center text-4xl">
      <a
        className="mr-4 cursor-pointer"
        aria-label="Rohin Chopra's linkedin page"
        href="https://www.linkedin.com/in/rohin-chopra-2b38791a0/"
        target="_blank"
        rel="noreferrer noopener"
      >
        <FaLinkedin className="text-[#0077b5] transition-colors duration-300 hover:text-black dark:text-white  dark:hover:text-[#0077b5]" />
      </a>
      <a
        className="mr-4 cursor-pointer"
        aria-label="Rohin Chopra's Github page"
        href="https://github.com/Rohin-Chopra"
        target="_blank"
        rel="noreferrer noopener"
      >
        <FaGithub className="text-[#171515] transition-colors duration-300 hover:text-black dark:text-white dark:hover:text-[#171515]" />
      </a>
    </div>
  </footer>
);
export { Footer };

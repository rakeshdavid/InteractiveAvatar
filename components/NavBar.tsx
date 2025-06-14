"use client";

import Link from "next/link";

import { GithubIcon, RivalistaLogo } from "./Icons";

export default function NavBar() {
  return (
    <>
      <div className="flex flex-row justify-center items-center w-[1000px] m-auto p-6">
        <div className="flex flex-row items-center gap-4">
          <RivalistaLogo />
          <div>
            <p className="text-xl font-semibold text-white">
              Interactive AI Avatar Demo
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

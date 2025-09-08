"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  // FaFacebookSquare,
  // FaGooglePlusG,
  // FaInstagram,
  // FaLinkedinIn,
  FaPhoneAlt,
  // FaTwitter,
  // FaYoutube,
} from "react-icons/fa";
import {
  FaChevronDown,
  FaChevronUp,
  FaLocationDot,
  // FaPinterest,
} from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
// import { IoLogoRss } from "react-icons/io";
import { IoLocationOutline, IoMail } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";

export default function Home() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  const cardData = [
    {
      image: "/LandingPage/cardOne.svg",
      alt: "Inventory Image",
      title: "Streamlines",
      title1: "Procurement",
      description:
        "The system simplifies the entire procurement cycle by automating purchase requests, tracking supplier orders, and managing approvals digitally. It ensures medicines are available on time, prevents stockouts, and minimizes manual errors. With transparent workflows and real-time updates, pharmacies can maintain steady supply, negotiate better with suppliers, and reduce operational inefficiencies.",
    },
    {
      image: "/LandingPage/cardTwo.svg",
      alt: "Inventory Image",
      title: "Simplifies",
      title1: "Sales & Billing",
      description:
        "The billing module generates accurate invoices within seconds, applies discounts, and supports multiple payment modes including cash, cards, and digital wallets. It ensures smooth retail and wholesale operations while reducing billing errors. By offering fast, reliable, and transparent billing processes, pharmacies can improve customer experience, speed up transactions, and maintain accurate financial records.",
    },
    {
      image: "/LandingPage/cardThree.svg",
      alt: "Inventory Image",
      title: "Generates",
      title1: "Inventory reports",
      description:
        "The system provides detailed inventory reports covering stock levels, expiry dates, and batch-wise movements. These reports help pharmacists analyze usage patterns, forecast demand, and identify expiring or excess stock. With automated and customizable reporting, decision-making becomes easier, regulatory compliance improves, and pharmacies can reduce wastage while ensuring medicines are always available for patients.",
    },
    {
      image: "/LandingPage/cardFour.svg",
      alt: "Inventory Image",
      title: "Provides",
      title1: "Inventory statistics",
      description:
        "Inventory statistics offer real-time insights into product performance, highlighting fast-moving, slow-moving, and near-expiry medicines. Through visual dashboards and intelligent analytics, pharmacists can track stock flow efficiently, avoid overstocking, and optimize storage space. These insights support proactive decision-making, reduce financial losses, and enhance overall inventory management by ensuring the right medicines are always available.",
    },
    {
      image: "/LandingPage/cardFive.svg",
      alt: "Inventory Image",
      title: "Delivers",
      title1: "Sales & Billing statistics",
      description:
        "Billing statistics summarize daily, weekly, and monthly sales trends, outstanding balances, and payment collections. The module gives pharmacy owners valuable financial insights, enabling them to track revenue growth, identify peak sales periods, and manage receivables efficiently. By providing comprehensive financial analytics, pharmacies can plan better, improve profitability, and make informed business decisions for growth.",
    },
  ];

  const items = [
    {
      title: "Smart Dashboard",
      content:
        "Gives a 360° view of your pharmacy with real-time insights on sales, billing, patients, and inventory. From financial summaries to low-stock alerts, everything is organized in one place so you can make faster, smarter decisions.",
    },
    {
      title: "Secure Role Based Access Control",
      content:
        "Keeps your pharmacy operations safe and organized by giving each team member access only to what they need. This prevents unauthorized changes, reduces errors, and streamlines workflows — ensuring smooth management from billing to inventory without compromising security.",
    },
    {
      title: "Automated Important Alerts",
      content:
        "Tracks medicine expiry dates in real time and notifies you before stock becomes unsellable. This helps reduce losses, ensures compliance, and keeps only safe, usable medicines available for customers.",
    },
  ];

  const questions = [
    {
      title: "What is Tiamed?",
      content:
        "TiaMeds Pharma Module is a comprehensive software solution designed for pharmacies to streamline day-to-day operations. It integrates inventory management, billing, purchase handling, sales tracking, and reporting into a single platform, reducing manual work and errors.",
    },
    {
      title: "Who can use this software?",
      content:
        "The software is ideal for pharmacy owners, store managers, inventory managers, and front-desk staff. Each role can access functions specific to their responsibilities, ensuring smooth workflow and efficient task management across the pharmacy.",
    },
    {
      title: "How does it manage inventory?",
      content:
        "The system tracks all medicines with batch numbers, expiry dates, and current stock levels. It automatically alerts users about low stock, nearing-expiry products, and helps maintain optimal inventory levels, preventing stock-outs or wastage.",
    },
    {
      title: "Can it generate bills automatically?",
      content:
        "Yes, the software supports fast and accurate billing. It can generate GST-compliant invoices, apply discounts, and accept multiple payment modes. It is suitable for both retail and wholesale transactions, reducing billing errors and saving time.",
    },
    {
      title: "Does it handle purchase and supplier management?",
      content:
        "Absolutely. TiaMeds can automate purchase requests based on inventory levels, track supplier orders, and maintain a detailed supplier database. This ensures timely replenishment of medicines and better vendor management.",
    },
    {
      title: "Can I assign roles to my staff?",
      content:
        "Yes, the software supports role-based access. You can assign specific permissions to staff members based on their roles—store managers, inventory managers, and front-desk operators—so everyone can only access the modules they need, increasing security and accountability.",
    },
    {
      title: "Can I generate reports and analytics?",
      content:
        "Yes, the software provides real-time reports and analytics on stock movement, sales trends, expiry alerts, and financial summaries. These insights help in making informed business decisions, monitoring pharmacy performance, and ensuring compliance with regulations.",
    },
    {
      title: "Is the software secure and reliable?",
      content:
        "Yes, TiaMeds ensures secure data storage, role-based access controls, and regular backups. Sensitive data such as sales, inventory, and supplier information are protected, making the system reliable for daily pharmacy operations.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <header className="py-4 px-32 bg-[#FAFAFA] flex justify-between items-center shadow-md">
        <div className="flex gap-3">
          <Image
            src="/TiamedsIcon.svg"
            alt="Company Logo"
            width={45}
            height={32}
          />
          <Image
            src="/TiamedsLogo.svg"
            alt="Company Logo"
            width={90}
            height={32}
          />
        </div>
        <div className="flex gap-10 font-normal text-base items-center cursor-pointer">
          <div
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Features
          </div>
          <div
            onClick={() =>
              document
                .getElementById("faq")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            FAQ’s
          </div>
          <div
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Contact Us
          </div>
          <div>
            <button
              className="bg-[#4B0082] text-white rounded-lg px-6 py-2 cursor-pointer"
              onClick={() => router.push("/login")}
            >
              Partner With Us
            </button>
          </div>
        </div>
      </header>

      <main>
        <div className="relative py-10 bg-[url('/LandingPage/bgOne.png')] bg-cover bg-center bg-no-repeat">
          <div className="absolute top-[550px] left-0 w-full h-[140px] -translate-y-1/2 bg-[url('/LandingPage/bgTwo.svg')] bg-cover bg-center bg-no-repeat z-0"></div>

          <div className="absolute inset-0 bg-white/40 z-0"></div>

          <div className="relative z-10 flex flex-col py-10 items-center gap-5">
            <div className="text-6xl font-normal">
              <span className="font-bold text-[#4B0082]">S</span>mart.{" "}
              <span className="font-bold text-[#4B0082]">S</span>imple.{" "}
              <span className="font-bold text-[#4B0082]">S</span>ecure
            </div>

            <div className="text-xl font-normal text-center">
              &quot;Comprehensive pharmacy management software for <br /> efficient
              healthcare delivery solutions.&quot;
            </div>
            <div>
              <button
                className="bg-[#4B0082] text-white rounded-lg px-6 py-2 cursor-pointer"
                onClick={() => router.push("/login")}
              >
                Partner With Us
              </button>
            </div>
          </div>

          <div className="relative z-10 flex justify-center gap-8 py-10">
            <Image
              src="/LandingPage/imgOne.svg"
              alt="Inventory Image"
              width={320}
              height={320}
              className="scale-95 opacity-90"
            />
            <Image
              src="/LandingPage/imgTwo.svg"
              alt="Sales Image"
              width={370}
              height={370}
              className="scale-105 z-10"
            />
            <Image
              src="/LandingPage/imgThree.svg"
              alt="Analytic Image"
              width={320}
              height={320}
              className="scale-95 opacity-90"
            />
          </div>
        </div>

        <div className="flex gap-6 px-16 pt-16">
          {cardData.map((card, index) => (
            <div
              key={index}
              className="relative w-[260px] h-[640px] group overflow-hidden rounded-xl flex-none"
            >
              <Image
                src={card.image}
                alt={card.alt}
                width={260}
                height={640}
                className="block object-cover transition duration-300 group-hover:blur-[2px] group-hover:brightness-65 cursor-pointer"
              />

              <div className="pointer-events-none absolute inset-0 flex flex-col justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out font-normal">
                <div className="text-gray-200 p-4">
                  <div className="text-sm">{card.title}</div>
                  <div className="text-base">{card.title1}</div>
                  <p className="text-sm pt-5">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div id="features" className="bg-[#F3ECF8] h-[650px] p-20">
          <div className="text-3xl font-semibold">Features</div>

          <div className="flex justify-between mt-16 ">
            <div className="w-96 font-normal">
              {items.map((item, index) => (
                <div key={index}>
                  {/* Header row */}
                  <div
                    className="flex justify-between items-center py-5 cursor-pointer text-lg font-medium"
                    onClick={() => toggle(index)}
                  >
                    <span>{item.title}</span>
                    {openIndex === index ? (
                      <FaChevronUp size={11} />
                    ) : (
                      <FaChevronDown size={11} />
                    )}
                  </div>

                  <div className="border border-b-0 text-[#726C6C]" />

                  {openIndex === index && (
                    <div className="p-4 text-base animate-slideDown leading-relaxed">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div>
              <Image
                src="/LandingPage/imgFour.svg"
                alt="Inventory Image"
                width={726}
                height={440}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col p-20 gap-6">
          <div className="text-3xl font-bold">How to Get Started?</div>
          <div className="text-lg font-normal">
            Join easily, get approved swiftly, and boost your market
            penetration.
          </div>
        </div>

        <Image
          src="/LandingPage/imgFive.svg"
          alt="Company Logo"
          width={1520}
          height={1920}
        />

        <div id="faq" className="flex justify-between py-20 px-28 gap-32">
          <div className="w-1/4 space-y-5">
            <div className="text-3xl font-bold">Frequently Asked Questions</div>
            <div className="text-xl font-normal">
              Here are some common <br />
              questions about partnering <br />
              with Tiamed
            </div>
          </div>
          <div className="w-3/4 font-normal text-[#180029]">
            {questions.map((question, index) => (
              <div key={index}>
                <div
                  className="flex justify-between items-center py-5 cursor-pointer text-xl font-medium"
                  onClick={() => toggle(index)}
                >
                  <span>{question.title}</span>
                  {openIndex === index ? (
                    <FaChevronUp size={11} />
                  ) : (
                    <FaChevronDown size={11} />
                  )}
                </div>

                <div className="border border-b-0 text-[#180029]" />

                {openIndex === index && (
                  <div className="p-4 text-base animate-slideDown leading-relaxed">
                    {question.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          id="contact"
          className="h-[720px] bg-[#E9CCFF] flex items-center justify-center relative"
        >
          <div className="w-[783px] h-[659px] bg-[#F3ECF8] rounded-2xl flex flex-col ml-44 pl-64 pt-24 space-y-4">
            <div className="space-y-1">
              <div className="text-2xl font-medium">Get in touch</div>
              <div className="text-base font-normal text-[#726C6C]">
                Want to know more? Drop us a message below
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="name"
                  className="text-[#433E3F] text-sm font-normal"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  onClick={handleClick}
                  className="bg-white rounded-lg px-4 py-3 outline-none placeholder-[#726C6C] w-[450px]"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="email"
                  className="text-[#433E3F] text-sm font-normal"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  placeholder="Your Email"
                  onClick={handleClick}
                  className="bg-white rounded-lg px-4 py-3 outline-none placeholder-[#726C6C] w-[450px]"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="phone"
                  className="text-[#433E3F] text-sm font-normal"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="Your Phone Number"
                  onClick={handleClick}
                  className="bg-white rounded-lg px-4 py-3 outline-none placeholder-[#726C6C] w-[450px]"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="phone"
                  className="text-[#433E3F] text-sm font-normal"
                >
                  Message
                </label>
                <textarea
                  id="phone"
                  placeholder="Type your message here..."
                  onClick={handleClick}
                  className="bg-white rounded-lg px-4 py-3 outline-none placeholder-[#726C6C] w-[450px]"
                />
              </div>
            </div>

            <div>
              <button
                className="bg-[#4B0082] text-white rounded-3xl px-7 py-3 cursor-pointer"
                onClick={handleClick}
              >
                Send Message
              </button>

              {showToast && (
                <div className="fixed top-5 right-5 bg-gray-700 text-white px-4 py-2 rounded shadow-lg text-sm">
                  Feature coming soon 🚀
                </div>
              )}
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[120%] bg-[#311745] text-white w-[442px] h-[512px] py-20 px-16 space-y-10 rounded-2xl shadow-lg">
              <div className="text-3xl font-semibold">Contact Us</div>

              <div className="flex gap-4 text-lg font-normal items-center">
                <span>
                  <IoLocationOutline />
                </span>
                <span>
                  Sy. No. 59, 2nd Floor, Dakshina Murthy Towers, Devanooru,
                  Rajeevnagara 2nd Stage, Udayagiri, Mysore 570019.
                </span>
              </div>

              <div className="flex gap-4 text-lg font-normal items-center">
                <span>
                  <FiPhone />
                </span>
                <span> +91 821 428 0152</span>
              </div>

              <div className="flex gap-4 text-lg font-normal items-center">
                <span>
                  <MdOutlineEmail />
                </span>
                <span>info@sudhanandgroup.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[543px] bg-[#0A0A0B] text-white py-20 px-44">
          <div className="border border-b-0 text-[#FAFAFA]" />
          <div className="flex justify-between py-28 px-16">
            <div className="flex flex-col items-center space-y-5">
              <Image
                src="/LandingPage/newLogoOne.svg"
                alt="Company Logo"
                width={97}
                height={90}
              />
              <Image
                src="/LandingPage/newIconOne.svg"
                alt="Company Logo"
                width={156}
                height={45}
              />
            </div>

            <div className="max-w-lg space-y-5">
              <div className="flex items-center gap-4 text-sm font-normal">
                <span>
                  <FaLocationDot size={18} />
                </span>
                <span>
                  Sy. No. 59, 2nd Floor, Dakshina Murthy Towers, Devanooru,
                  Rajeevnagara 2nd Stage, Udayagiri, Mysore 570019.
                </span>
              </div>

              <div className="flex justify-between">
                <div className="flex gap-4 text-sm font-normal items-center">
                  <span>
                    <FaPhoneAlt size={18} />
                  </span>
                  <span> +91 821 428 0152</span>
                </div>

                <div className="flex gap-4 text-sm font-normal items-center">
                  <span>
                    <IoMail size={18} />
                  </span>
                  <span>info@sudhanandgroup.com</span>
                </div>
              </div>

              {/* <div className="flex justify-around pt-3 items-center">
                <span>Social Media</span>
                <span>
                  <FaFacebookSquare />
                </span>
                <span>
                  <FaTwitter />
                </span>
                <span>
                  <FaLinkedinIn />
                </span>
                <span>
                  <FaYoutube />
                </span>
                <span>
                  <FaInstagram />
                </span>
                <span>
                  <FaGooglePlusG />
                </span>
                <span>
                  <FaPinterest />
                </span>
                <span>
                  <IoLogoRss />
                </span>
              </div> */}
            </div>
          </div>
          <div className="border border-b-0 text-[#FAFAFA]" />

          <div className="flex justify-between text-sm pt-6">
            <div className="flex space-x-10">
              <div>Privacy Policy</div>
              <div>Disclaimer</div>
            </div>

            <div>Copyright © 2025 • TiaMeds Technologies Ltd.</div>
          </div>
        </div>
      </main>
    </>
  );
}
